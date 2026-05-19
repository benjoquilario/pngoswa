import { revalidatePath } from "next/cache"

import { isDatabaseConnectionError, prisma } from "@/lib/db"
import type { MembershipUploadedFile } from "@/lib/membership-form"
import { utapi } from "@/lib/uploadthing"

const DEFAULT_PAYMENT_SETTINGS_ID = "default"
export const DEFAULT_GCASH_NUMBER = "09094432115"

export const DEFAULT_PAYMENT_PRIVACY_MESSAGE =
  "Your payment and personal information are protected and used only for membership verification, records, and official PNGOSWA communication."

export type PaymentSettingsFile = MembershipUploadedFile

export type PublicPaymentSettings = {
  gcashNumber: string
  mayaNumber: string
  privacyMessage: string
  qrCode: PaymentSettingsFile | null
}

type PaymentSettingsUpdateResult =
  | {
      ok: true
      settings: PublicPaymentSettings
      message: string
    }
  | {
      ok: false
      status: number
      message: string
      errors?: Record<string, string>
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseQrCodeFile(
  value: unknown,
  errors: Record<string, string>
): PaymentSettingsFile | null {
  if (value == null) {
    return null
  }

  if (!isRecord(value)) {
    errors.qrCode = "QR code upload is invalid. Please upload the file again."
    return null
  }

  const key = typeof value.key === "string" ? value.key : ""
  const name = typeof value.name === "string" ? value.name : ""
  const type = typeof value.type === "string" ? value.type : ""
  const ufsUrl = typeof value.ufsUrl === "string" ? value.ufsUrl : ""
  const size = typeof value.size === "number" ? value.size : NaN

  if (!key || !name || !type || !ufsUrl || !Number.isFinite(size)) {
    errors.qrCode = "QR code upload is invalid. Please upload the file again."
    return null
  }

  if (!["image/jpeg", "image/png"].includes(type)) {
    errors.qrCode = "QR code must be a JPG or PNG image."
    return null
  }

  if (size > 8 * 1024 * 1024) {
    errors.qrCode = "QR code must be smaller than 8MB."
    return null
  }

  return {
    key,
    name,
    size,
    type,
    ufsUrl,
  }
}

function mapPaymentSettings(
  settings: {
    gcashNumber: string | null
    mayaNumber: string | null
    privacyMessage: string | null
    qrCodeStoredName: string | null
    qrCodeOriginalName: string | null
    qrCodeUrl: string | null
    qrCodeMimeType: string | null
    qrCodeSizeBytes: number | null
  } | null
): PublicPaymentSettings {
  return {
    gcashNumber: settings?.gcashNumber?.trim() || DEFAULT_GCASH_NUMBER,
    mayaNumber: settings?.mayaNumber ?? "",
    privacyMessage:
      settings?.privacyMessage?.trim() || DEFAULT_PAYMENT_PRIVACY_MESSAGE,
    qrCode:
      settings?.qrCodeStoredName &&
      settings.qrCodeOriginalName &&
      settings.qrCodeUrl &&
      settings.qrCodeMimeType &&
      typeof settings.qrCodeSizeBytes === "number"
        ? {
            key: settings.qrCodeStoredName,
            name: settings.qrCodeOriginalName,
            size: settings.qrCodeSizeBytes,
            type: settings.qrCodeMimeType,
            ufsUrl: settings.qrCodeUrl,
          }
        : null,
  }
}

export async function getPublicPaymentSettings(): Promise<PublicPaymentSettings> {
  if (!process.env.DATABASE_URL) {
    return mapPaymentSettings(null)
  }

  try {
    const settings = await prisma.paymentSettings.findUnique({
      where: {
        id: DEFAULT_PAYMENT_SETTINGS_ID,
      },
    })

    return mapPaymentSettings(settings)
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return mapPaymentSettings(null)
    }

    throw error
  }
}

export async function updatePaymentSettings(
  input: unknown
): Promise<PaymentSettingsUpdateResult> {
  if (!isRecord(input)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid payment settings payload.",
    }
  }

  const errors: Record<string, string> = {}
  const gcashNumber = normalizeOptionalString(input.gcashNumber)
  const mayaNumber = normalizeOptionalString(input.mayaNumber)
  const privacyMessage =
    normalizeOptionalString(input.privacyMessage) ||
    DEFAULT_PAYMENT_PRIVACY_MESSAGE
  const qrCode = parseQrCodeFile(input.qrCode, errors)

  if (privacyMessage.length > 400) {
    errors.privacyMessage = "Privacy message must be 400 characters or less."
  }

  if (gcashNumber.length > 40) {
    errors.gcashNumber = "GCash number must be 40 characters or less."
  }

  if (mayaNumber.length > 40) {
    errors.mayaNumber = "Maya number must be 40 characters or less."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      status: 400,
      message: "Please review the payment settings and try again.",
      errors,
    }
  }

  const existing = await prisma.paymentSettings.findUnique({
    where: {
      id: DEFAULT_PAYMENT_SETTINGS_ID,
    },
  })

  const uploadedKey =
    qrCode && qrCode.key !== existing?.qrCodeStoredName ? qrCode.key : null
  const replacedKey =
    existing?.qrCodeStoredName && existing.qrCodeStoredName !== qrCode?.key
      ? existing.qrCodeStoredName
      : null

  try {
    const saved = await prisma.paymentSettings.upsert({
      where: {
        id: DEFAULT_PAYMENT_SETTINGS_ID,
      },
      update: {
        gcashNumber: gcashNumber || null,
        mayaNumber: mayaNumber || null,
        privacyMessage,
        qrCodeStoredName: qrCode?.key ?? null,
        qrCodeOriginalName: qrCode?.name ?? null,
        qrCodeUrl: qrCode?.ufsUrl ?? null,
        qrCodeMimeType: qrCode?.type ?? null,
        qrCodeSizeBytes: qrCode?.size ?? null,
      },
      create: {
        id: DEFAULT_PAYMENT_SETTINGS_ID,
        gcashNumber: gcashNumber || null,
        mayaNumber: mayaNumber || null,
        privacyMessage,
        qrCodeStoredName: qrCode?.key ?? null,
        qrCodeOriginalName: qrCode?.name ?? null,
        qrCodeUrl: qrCode?.ufsUrl ?? null,
        qrCodeMimeType: qrCode?.type ?? null,
        qrCodeSizeBytes: qrCode?.size ?? null,
      },
    })

    if (replacedKey) {
      try {
        await utapi.deleteFiles([replacedKey])
      } catch (cleanupError) {
        console.error(
          "Failed to clean up replaced payment QR code upload:",
          cleanupError
        )
      }
    }

    revalidatePath("/membership/apply")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/dashboard/payment-settings")

    return {
      ok: true,
      settings: mapPaymentSettings(saved),
      message: "Payment settings updated successfully.",
    }
  } catch (error) {
    if (uploadedKey) {
      try {
        await utapi.deleteFiles([uploadedKey])
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded payment QR code after save failure:",
          cleanupError
        )
      }
    }

    throw error
  }
}
