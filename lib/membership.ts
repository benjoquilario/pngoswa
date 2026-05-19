import { createHash, randomUUID } from "node:crypto"

import { requestMagicLink } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import type {
  MembershipStatus as MembershipStatusValue,
  ReviewActionType,
} from "@/lib/generated/prisma/enums"
import type {
  MembershipApplicationFormValues,
  MembershipUploadedFile,
} from "@/lib/membership-form"
import {
  removeApplicationStorage,
  saveUploadedFile,
  type StoredUpload,
} from "@/lib/storage"
import {
  allowedUploadThingDocumentMimeTypes,
  allowedUploadThingImageMimeTypes,
  utapi,
} from "@/lib/uploadthing"

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export const REGULAR_MEMBERSHIP_WAIVER_LIMIT = 100
export const REGULAR_MEMBERSHIP_WAIVER_AMOUNT = 500
export const ID_AND_SHIRT_FEE_AMOUNT = 500
export const RESERVED_OFFICER_APPLICATION_SLOTS = 10
export const FIRST_GENERAL_APPLICATION_SEQUENCE =
  RESERVED_OFFICER_APPLICATION_SLOTS + 1
const APPLICATION_NUMBER_PAD_LENGTH = 5
const NO_PROOF_OF_PAYMENT_REVIEW_SUBJECT =
  "Required payment proof still missing after application submission"
const PAYMENT_PROOF_RECEIVED_REVIEW_SUBJECT =
  "Required payment proof uploaded from member profile"

const genderMap = {
  female: "FEMALE",
  male: "MALE",
  "non-binary": "NON_BINARY",
  "prefer-not-to-say": "PREFER_NOT_TO_SAY",
} as const

const civilStatusMap = {
  single: "SINGLE",
  married: "MARRIED",
  widowed: "WIDOWED",
  separated: "SEPARATED",
} as const

const employmentStatusMap = {
  regular: "REGULAR",
  contractual: "CONTRACTUAL",
  volunteer: "VOLUNTEER",
} as const

const paymentModeMap = {
  gcash: "GCASH",
  maya: "MAYA",
  "qr-code": "QR_CODE",
  "bank-transfer": "BANK_TRANSFER",
  cash: "CASH",
  other: "OTHER",
} as const

const membershipTypeMap = {
  regular: "REGULAR",
  lifetime: "LIFETIME",
  honorary: "HONORARY",
} as const

const paymentCategoryMap = {
  "waived-free": "WAIVED_FREE_MEMBERSHIP",
  "regular-annual": "REGULAR_ANNUAL_MEMBERSHIP",
  "lifetime-no-annual": "LIFETIME_NO_ANNUAL_MEMBERSHIP",
} as const

const allowedDocumentMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
])

type FieldErrors = Record<string, string>

type ParsedApplicationInput = {
  firstName: string
  lastName: string
  middleName?: string
  gender: (typeof genderMap)[keyof typeof genderMap]
  dateOfBirth: Date
  civilStatus: (typeof civilStatusMap)[keyof typeof civilStatusMap]
  prcLicense?: string
  dateOfRegistration: Date
  contactNumber: string
  email: string
  region: string
  organization: string
  officeAddress: string
  position: string
  employmentStatus: (typeof employmentStatusMap)[keyof typeof employmentStatusMap]
  lengthOfService: string
  areaOfPractice: string
  degree: string
  school: string
  yearGraduated: string
  postgraduateStudies?: string
  specializations: string
  otherOrganizations?: string
  membershipType: (typeof membershipTypeMap)[keyof typeof membershipTypeMap]
  paymentMode: (typeof paymentModeMap)[keyof typeof paymentModeMap]
  paymentCategory: (typeof paymentCategoryMap)[keyof typeof paymentCategoryMap]
  isConventionAttendee: boolean
  agreedToPrivacy: boolean
}

type PaymentCategoryValue =
  (typeof paymentCategoryMap)[keyof typeof paymentCategoryMap]

type ParsedLegacyDocuments = {
  resumeUpload: File
  employmentProofUpload?: File
  prcLicenseUpload?: File
  endorsementUpload?: File
  certificateUpload?: File
  membershipPaymentProof?: File
  shirtIdPaymentProof?: File
  photoUpload: File
}

type ParsedUploadedDocuments = {
  resumeUpload: MembershipUploadedFile
  employmentProofUpload?: MembershipUploadedFile
  prcLicenseUpload?: MembershipUploadedFile
  endorsementUpload?: MembershipUploadedFile
  certificateUpload?: MembershipUploadedFile
  membershipPaymentProof?: MembershipUploadedFile
  shirtIdPaymentProof?: MembershipUploadedFile
  photoUpload: MembershipUploadedFile
}

type ParsedMembershipApplication =
  | {
      ok: true
      source: "legacy"
      values: ParsedApplicationInput
      documents: ParsedLegacyDocuments
    }
  | {
      ok: true
      source: "uploadthing"
      values: ParsedApplicationInput
      documents: ParsedUploadedDocuments
    }
  | {
      ok: false
      errors: FieldErrors
    }

type MembershipDocumentTypeValue =
  | "RESUME"
  | "EMPLOYMENT_PROOF"
  | "PRC_LICENSE"
  | "ENDORSEMENT"
  | "ATTENDANCE_CERTIFICATE"
  | "PAYMENT_PROOF"
  | "MEMBERSHIP_PAYMENT_PROOF"
  | "SHIRT_ID_PAYMENT_PROOF"
  | "ID_PHOTO"

type StoredMembershipDocument = StoredUpload & {
  type: MembershipDocumentTypeValue
  label: string
}

type ExistingSubmissionResult = {
  applicationId: string
  applicationNumber: string
  status: string
}

type MemberDocumentUpdateFieldName =
  | "resumeUpload"
  | "employmentProofUpload"
  | "prcLicenseUpload"
  | "endorsementUpload"
  | "certificateUpload"
  | "membershipPaymentProof"
  | "shirtIdPaymentProof"
  | "photoUpload"

type MemberDocumentUpdateResult =
  | {
      ok: true
      message: string
      updatedDocuments: string[]
    }
  | {
      ok: false
      status: number
      message: string
      errors?: Record<string, string>
    }

const memberDocumentFieldDefinitions: Array<{
  fieldName: MemberDocumentUpdateFieldName
  type: MembershipDocumentTypeValue
  label: string
  allowedMimeTypes: Set<string>
}> = [
  {
    fieldName: "resumeUpload",
    type: "RESUME",
    label: "CV / Resume",
    allowedMimeTypes: allowedUploadThingDocumentMimeTypes,
  },
  {
    fieldName: "employmentProofUpload",
    type: "EMPLOYMENT_PROOF",
    label: "Proof of Employment / Leadership Role",
    allowedMimeTypes: allowedUploadThingDocumentMimeTypes,
  },
  {
    fieldName: "prcLicenseUpload",
    type: "PRC_LICENSE",
    label: "PRC License Copy",
    allowedMimeTypes: allowedUploadThingDocumentMimeTypes,
  },
  {
    fieldName: "endorsementUpload",
    type: "ENDORSEMENT",
    label: "Recommendation / Endorsement",
    allowedMimeTypes: allowedUploadThingDocumentMimeTypes,
  },
  {
    fieldName: "certificateUpload",
    type: "ATTENDANCE_CERTIFICATE",
    label: "Attendance Certificate",
    allowedMimeTypes: allowedUploadThingDocumentMimeTypes,
  },
  {
    fieldName: "membershipPaymentProof",
    type: "MEMBERSHIP_PAYMENT_PROOF",
    label: "Membership Fee Proof of Payment",
    allowedMimeTypes: allowedUploadThingDocumentMimeTypes,
  },
  {
    fieldName: "shirtIdPaymentProof",
    type: "SHIRT_ID_PAYMENT_PROOF",
    label: "T-Shirt and ID Proof of Payment",
    allowedMimeTypes: allowedUploadThingDocumentMimeTypes,
  },
  {
    fieldName: "photoUpload",
    type: "ID_PHOTO",
    label: "2x2 ID Photo",
    allowedMimeTypes: allowedUploadThingImageMimeTypes,
  },
]

type MemberDocumentUpdateItem =
  (typeof memberDocumentFieldDefinitions)[number] & {
    file: MembershipUploadedFile
  }

function readString(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName)
  return typeof value === "string" ? value.trim() : ""
}

function readRequiredString(
  formData: FormData,
  fieldName: string,
  label: string,
  errors: FieldErrors
) {
  const value = readString(formData, fieldName)

  if (!value) {
    errors[fieldName] = `${label} is required.`
  }

  return value
}

function readDate(
  formData: FormData,
  fieldName: string,
  label: string,
  errors: FieldErrors
) {
  const value = readRequiredString(formData, fieldName, label, errors)
  const parsed = new Date(value)

  if (value && Number.isNaN(parsed.getTime())) {
    errors[fieldName] = `${label} is invalid.`
  }

  return parsed
}

function readEnumValue<TMap extends Record<string, string>>(
  formData: FormData,
  fieldName: string,
  label: string,
  mapper: TMap,
  errors: FieldErrors
) {
  const rawValue = readRequiredString(formData, fieldName, label, errors)
  const mappedValue = mapper[rawValue as keyof TMap]

  if (rawValue && !mappedValue) {
    errors[fieldName] = `${label} is invalid.`
  }

  return mappedValue
}

function readFile(
  formData: FormData,
  fieldName: string,
  label: string,
  errors: FieldErrors,
  required: boolean
) {
  const entry = formData.get(fieldName)

  if (!(entry instanceof File) || entry.size === 0) {
    if (required) {
      errors[fieldName] = `${label} is required.`
    }

    return undefined
  }

  if (entry.size > MAX_UPLOAD_BYTES) {
    errors[fieldName] = `${label} must be smaller than 8MB.`
    return undefined
  }

  if (entry.type && !allowedDocumentMimeTypes.has(entry.type)) {
    errors[fieldName] = `${label} must be a PDF, JPG, or PNG file.`
    return undefined
  }

  return entry
}

function validateEmail(email: string, errors: FieldErrors) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address."
  }
}

function validateYear(year: string, errors: FieldErrors) {
  if (!/^\d{4}$/.test(year)) {
    errors.yearGraduated = "Year graduated must be a 4-digit year."
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readPayloadString(
  payload: Record<string, unknown>,
  fieldName: keyof MembershipApplicationFormValues | string
) {
  const value = payload[fieldName]
  return typeof value === "string" ? value.trim() : ""
}

function readPayloadRequiredString(
  payload: Record<string, unknown>,
  fieldName: keyof MembershipApplicationFormValues | string,
  label: string,
  errors: FieldErrors
) {
  const value = readPayloadString(payload, fieldName)

  if (!value) {
    errors[String(fieldName)] = `${label} is required.`
  }

  return value
}

function readPayloadDate(
  payload: Record<string, unknown>,
  fieldName: keyof MembershipApplicationFormValues | string,
  label: string,
  errors: FieldErrors
) {
  const value = readPayloadRequiredString(payload, fieldName, label, errors)
  const parsed = new Date(value)

  if (value && Number.isNaN(parsed.getTime())) {
    errors[String(fieldName)] = `${label} is invalid.`
  }

  return parsed
}

function readPayloadEnumValue<TMap extends Record<string, string>>(
  payload: Record<string, unknown>,
  fieldName: keyof MembershipApplicationFormValues | string,
  label: string,
  mapper: TMap,
  errors: FieldErrors
) {
  const rawValue = readPayloadRequiredString(payload, fieldName, label, errors)
  const mappedValue = mapper[rawValue as keyof TMap]

  if (rawValue && !mappedValue) {
    errors[String(fieldName)] = `${label} is invalid.`
  }

  return mappedValue
}

function readUploadedDocument(
  payload: Record<string, unknown>,
  fieldName: keyof MembershipApplicationFormValues,
  label: string,
  errors: FieldErrors,
  required: boolean,
  allowedMimeTypes: Set<string>
) {
  const entry = payload[fieldName]

  if (!isRecord(entry)) {
    if (required) {
      errors[fieldName] = `${label} is required.`
    }

    return undefined
  }

  const key = typeof entry.key === "string" ? entry.key : ""
  const name = typeof entry.name === "string" ? entry.name : ""
  const type = typeof entry.type === "string" ? entry.type : ""
  const ufsUrl = typeof entry.ufsUrl === "string" ? entry.ufsUrl : ""
  const size = typeof entry.size === "number" ? entry.size : NaN

  if (!key || !name || !type || !ufsUrl || !Number.isFinite(size)) {
    errors[fieldName] = `${label} is invalid. Please upload the file again.`
    return undefined
  }

  if (size > MAX_UPLOAD_BYTES) {
    errors[fieldName] = `${label} must be smaller than 8MB.`
    return undefined
  }

  if (!allowedMimeTypes.has(type)) {
    errors[fieldName] = `${label} must match the allowed file types.`
    return undefined
  }

  return {
    key,
    name,
    size,
    type,
    ufsUrl,
  } satisfies MembershipUploadedFile
}

function parseSharedValuesFromFormData(formData: FormData):
  | {
      ok: true
      values: ParsedApplicationInput
    }
  | {
      ok: false
      errors: FieldErrors
    } {
  const errors: FieldErrors = {}

  const values: ParsedApplicationInput = {
    firstName: readRequiredString(formData, "firstName", "First name", errors),
    lastName: readRequiredString(formData, "lastName", "Last name", errors),
    middleName: readString(formData, "middleName") || undefined,
    gender: readEnumValue(
      formData,
      "gender",
      "Sex / Gender",
      genderMap,
      errors
    )!,
    dateOfBirth: readDate(formData, "dateOfBirth", "Date of birth", errors),
    civilStatus: readEnumValue(
      formData,
      "civilStatus",
      "Civil status",
      civilStatusMap,
      errors
    )!,
    prcLicense: readString(formData, "prcLicense") || undefined,
    dateOfRegistration: readDate(
      formData,
      "dateOfRegistration",
      "Date of registration",
      errors
    ),
    contactNumber: readRequiredString(
      formData,
      "contactNumber",
      "Contact number",
      errors
    ),
    email: readRequiredString(
      formData,
      "email",
      "Email address",
      errors
    ).toLowerCase(),
    region: readRequiredString(formData, "region", "Region", errors),
    organization: readRequiredString(
      formData,
      "organization",
      "Organization / NGO",
      errors
    ),
    officeAddress: readRequiredString(
      formData,
      "officeAddress",
      "Office address",
      errors
    ),
    position: readRequiredString(
      formData,
      "position",
      "Position / Designation",
      errors
    ),
    employmentStatus: readEnumValue(
      formData,
      "employmentStatus",
      "Employment status",
      employmentStatusMap,
      errors
    )!,
    lengthOfService: readRequiredString(
      formData,
      "lengthOfService",
      "Length of service",
      errors
    ),
    areaOfPractice: readRequiredString(
      formData,
      "areaOfPractice",
      "Area of practice",
      errors
    ),
    degree: readRequiredString(formData, "degree", "Degree", errors),
    school: readRequiredString(
      formData,
      "school",
      "School / University",
      errors
    ),
    yearGraduated: readRequiredString(
      formData,
      "yearGraduated",
      "Year graduated",
      errors
    ),
    postgraduateStudies:
      readString(formData, "postgraduateStudies") || undefined,
    specializations: readRequiredString(
      formData,
      "specializations",
      "Areas of specialization",
      errors
    ),
    otherOrganizations: readString(formData, "otherOrganizations") || undefined,
    membershipType: readEnumValue(
      formData,
      "membershipType",
      "Membership type",
      membershipTypeMap,
      errors
    )!,
    paymentCategory: readEnumValue(
      formData,
      "paymentCategory",
      "Membership payment category",
      paymentCategoryMap,
      errors
    )!,
    paymentMode: readEnumValue(
      formData,
      "paymentMode",
      "Mode of payment",
      paymentModeMap,
      errors
    )!,
    isConventionAttendee:
      readRequiredString(
        formData,
        "isConventionAttendee",
        "Convention attendee selection",
        errors
      ) === "yes",
    agreedToPrivacy: readString(formData, "agreed") === "yes",
  }

  validateEmail(values.email, errors)
  validateYear(values.yearGraduated, errors)

  if (!values.agreedToPrivacy) {
    errors.agreed =
      "You must agree to the declaration and data privacy consent."
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, values }
}

function parseSharedValuesFromPayload(payload: Record<string, unknown>):
  | {
      ok: true
      values: ParsedApplicationInput
    }
  | {
      ok: false
      errors: FieldErrors
    } {
  const errors: FieldErrors = {}

  const values: ParsedApplicationInput = {
    firstName: readPayloadRequiredString(
      payload,
      "firstName",
      "First name",
      errors
    ),
    lastName: readPayloadRequiredString(
      payload,
      "lastName",
      "Last name",
      errors
    ),
    middleName: readPayloadString(payload, "middleName") || undefined,
    gender: readPayloadEnumValue(
      payload,
      "gender",
      "Sex / Gender",
      genderMap,
      errors
    )!,
    dateOfBirth: readPayloadDate(
      payload,
      "dateOfBirth",
      "Date of birth",
      errors
    ),
    civilStatus: readPayloadEnumValue(
      payload,
      "civilStatus",
      "Civil status",
      civilStatusMap,
      errors
    )!,
    prcLicense: readPayloadString(payload, "prcLicense") || undefined,
    dateOfRegistration: readPayloadDate(
      payload,
      "dateOfRegistration",
      "Date of registration",
      errors
    ),
    contactNumber: readPayloadRequiredString(
      payload,
      "contactNumber",
      "Contact number",
      errors
    ),
    email: readPayloadRequiredString(
      payload,
      "email",
      "Email address",
      errors
    ).toLowerCase(),
    region: readPayloadRequiredString(payload, "region", "Region", errors),
    organization: readPayloadRequiredString(
      payload,
      "organization",
      "Organization / NGO",
      errors
    ),
    officeAddress: readPayloadRequiredString(
      payload,
      "officeAddress",
      "Office address",
      errors
    ),
    position: readPayloadRequiredString(
      payload,
      "position",
      "Position / Designation",
      errors
    ),
    employmentStatus: readPayloadEnumValue(
      payload,
      "employmentStatus",
      "Employment status",
      employmentStatusMap,
      errors
    )!,
    lengthOfService: readPayloadRequiredString(
      payload,
      "lengthOfService",
      "Length of service",
      errors
    ),
    areaOfPractice: readPayloadRequiredString(
      payload,
      "areaOfPractice",
      "Area of practice",
      errors
    ),
    degree: readPayloadRequiredString(payload, "degree", "Degree", errors),
    school: readPayloadRequiredString(
      payload,
      "school",
      "School / University",
      errors
    ),
    yearGraduated: readPayloadRequiredString(
      payload,
      "yearGraduated",
      "Year graduated",
      errors
    ),
    postgraduateStudies:
      readPayloadString(payload, "postgraduateStudies") || undefined,
    specializations: readPayloadRequiredString(
      payload,
      "specializations",
      "Areas of specialization",
      errors
    ),
    otherOrganizations:
      readPayloadString(payload, "otherOrganizations") || undefined,
    membershipType: readPayloadEnumValue(
      payload,
      "membershipType",
      "Membership type",
      membershipTypeMap,
      errors
    )!,
    paymentCategory: readPayloadEnumValue(
      payload,
      "paymentCategory",
      "Membership payment category",
      paymentCategoryMap,
      errors
    )!,
    paymentMode: readPayloadEnumValue(
      payload,
      "paymentMode",
      "Mode of payment",
      paymentModeMap,
      errors
    )!,
    isConventionAttendee:
      readPayloadRequiredString(
        payload,
        "isConventionAttendee",
        "Convention attendee selection",
        errors
      ) === "yes",
    agreedToPrivacy: payload.agreed === true,
  }

  validateEmail(values.email, errors)
  validateYear(values.yearGraduated, errors)

  if (!values.agreedToPrivacy) {
    errors.agreed =
      "You must agree to the declaration and data privacy consent."
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, values }
}

function parseLegacyMembershipApplication(
  formData: FormData
): ParsedMembershipApplication {
  const parsedValues = parseSharedValuesFromFormData(formData)

  if (!parsedValues.ok) {
    return parsedValues
  }

  const errors: FieldErrors = {}
  const documents: ParsedLegacyDocuments = {
    resumeUpload: readFile(
      formData,
      "resumeUpload",
      "CV / Resume",
      errors,
      true
    )!,
    employmentProofUpload: readFile(
      formData,
      "employmentProofUpload",
      "Proof of employment or leadership role",
      errors,
      parsedValues.values.membershipType !== "HONORARY"
    ),
    prcLicenseUpload: readFile(
      formData,
      "prcLicenseUpload",
      "PRC license copy",
      errors,
      false
    ),
    endorsementUpload: readFile(
      formData,
      "endorsementUpload",
      "Recommendation / endorsement",
      errors,
      parsedValues.values.membershipType === "HONORARY"
    ),
    certificateUpload: readFile(
      formData,
      "certificateUpload",
      "Certificate of participation / attendance",
      errors,
      parsedValues.values.isConventionAttendee
    ),
    membershipPaymentProof: readFile(
      formData,
      "membershipPaymentProof",
      "Membership fee proof of payment",
      errors,
      false
    ),
    shirtIdPaymentProof: readFile(
      formData,
      "shirtIdPaymentProof",
      "T-Shirt and ID proof of payment",
      errors,
      false
    ),
    photoUpload: readFile(formData, "photoUpload", "2x2 photo", errors, true)!,
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    source: "legacy",
    values: parsedValues.values,
    documents,
  }
}

function parseUploadedMembershipApplication(
  payload: unknown
): ParsedMembershipApplication {
  if (!isRecord(payload)) {
    return {
      ok: false,
      errors: {
        form: "Invalid application payload.",
      },
    }
  }

  const parsedValues = parseSharedValuesFromPayload(payload)

  if (!parsedValues.ok) {
    return parsedValues
  }

  const errors: FieldErrors = {}
  const documents: ParsedUploadedDocuments = {
    resumeUpload: readUploadedDocument(
      payload,
      "resumeUpload",
      "CV / Resume",
      errors,
      true,
      allowedUploadThingDocumentMimeTypes
    )!,
    employmentProofUpload: readUploadedDocument(
      payload,
      "employmentProofUpload",
      "Proof of employment or leadership role",
      errors,
      parsedValues.values.membershipType !== "HONORARY",
      allowedUploadThingDocumentMimeTypes
    ),
    prcLicenseUpload: readUploadedDocument(
      payload,
      "prcLicenseUpload",
      "PRC license copy",
      errors,
      false,
      allowedUploadThingDocumentMimeTypes
    ),
    endorsementUpload: readUploadedDocument(
      payload,
      "endorsementUpload",
      "Recommendation / endorsement",
      errors,
      parsedValues.values.membershipType === "HONORARY",
      allowedUploadThingDocumentMimeTypes
    ),
    certificateUpload: readUploadedDocument(
      payload,
      "certificateUpload",
      "Certificate of participation / attendance",
      errors,
      parsedValues.values.isConventionAttendee,
      allowedUploadThingDocumentMimeTypes
    ),
    membershipPaymentProof: readUploadedDocument(
      payload,
      "membershipPaymentProof",
      "Membership fee proof of payment",
      errors,
      false,
      allowedUploadThingDocumentMimeTypes
    ),
    shirtIdPaymentProof: readUploadedDocument(
      payload,
      "shirtIdPaymentProof",
      "T-Shirt and ID proof of payment",
      errors,
      false,
      allowedUploadThingDocumentMimeTypes
    ),
    photoUpload: readUploadedDocument(
      payload,
      "photoUpload",
      "2x2 photo",
      errors,
      true,
      allowedUploadThingImageMimeTypes
    )!,
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    source: "uploadthing",
    values: parsedValues.values,
    documents,
  }
}

function buildApplicationNumber(year: number, sequence: number) {
  return `PNGOSWA-${year}-${String(sequence).padStart(
    APPLICATION_NUMBER_PAD_LENGTH,
    "0"
  )}`
}

async function allocateApplicationSequence(
  year: number,
  kind: "general" | "officer"
) {
  if (kind === "officer") {
    const rows = await prisma.$queryRaw<Array<{ lastOfficerSequence: number }>>`
      INSERT INTO "ApplicationNumberSequence" (
        "year",
        "lastGeneralSequence",
        "lastOfficerSequence",
        "updatedAt"
      )
      VALUES (
        ${year},
        ${FIRST_GENERAL_APPLICATION_SEQUENCE - 1},
        1,
        NOW()
      )
      ON CONFLICT ("year")
      DO UPDATE SET
        "lastOfficerSequence" = "ApplicationNumberSequence"."lastOfficerSequence" + 1,
        "updatedAt" = NOW()
      RETURNING "lastOfficerSequence"
    `

    return rows[0]?.lastOfficerSequence ?? 1
  }

  const rows = await prisma.$queryRaw<Array<{ lastGeneralSequence: number }>>`
    INSERT INTO "ApplicationNumberSequence" (
      "year",
      "lastGeneralSequence",
      "lastOfficerSequence",
      "updatedAt"
    )
    VALUES (
      ${year},
      ${FIRST_GENERAL_APPLICATION_SEQUENCE},
      0,
      NOW()
    )
    ON CONFLICT ("year")
    DO UPDATE SET
      "lastGeneralSequence" = "ApplicationNumberSequence"."lastGeneralSequence" + 1,
      "updatedAt" = NOW()
    RETURNING "lastGeneralSequence"
  `

  return rows[0]?.lastGeneralSequence ?? FIRST_GENERAL_APPLICATION_SEQUENCE
}

export async function allocateNextApplicationNumber(year: number) {
  const sequence = await allocateApplicationSequence(year, "general")

  return buildApplicationNumber(year, sequence)
}

export async function allocateReservedOfficerApplicationNumber(year: number) {
  const reservedNumbers = Array.from(
    { length: RESERVED_OFFICER_APPLICATION_SLOTS },
    (_, index) => buildApplicationNumber(year, index + 1)
  )
  const existingReservedNumbers = await prisma.membershipApplication.findMany({
    where: {
      applicationNumber: {
        in: reservedNumbers,
      },
    },
    select: {
      applicationNumber: true,
    },
  })
  const usedNumbers = new Set(
    existingReservedNumbers.map((application) => application.applicationNumber)
  )
  const firstAvailableNumber = reservedNumbers.find(
    (applicationNumber) => !usedNumbers.has(applicationNumber)
  )

  if (!firstAvailableNumber) {
    return null
  }

  const sequenceNumber = Number(firstAvailableNumber.slice(-5))
  await prisma.applicationNumberSequence.upsert({
    where: {
      year,
    },
    update: {
      lastOfficerSequence: Math.max(sequenceNumber, 0),
    },
    create: {
      year,
      lastGeneralSequence: FIRST_GENERAL_APPLICATION_SEQUENCE - 1,
      lastOfficerSequence: sequenceNumber,
    },
  })

  return firstAvailableNumber
}

function buildSubmissionFingerprint(
  parsed: Extract<ParsedMembershipApplication, { ok: true }>
) {
  const documentSignature =
    parsed.source === "uploadthing"
      ? [
          parsed.documents.resumeUpload.key,
          parsed.documents.employmentProofUpload?.key ?? "",
          parsed.documents.prcLicenseUpload?.key ?? "",
          parsed.documents.endorsementUpload?.key ?? "",
          parsed.documents.certificateUpload?.key ?? "",
          parsed.documents.membershipPaymentProof?.key ?? "",
          parsed.documents.shirtIdPaymentProof?.key ?? "",
          parsed.documents.photoUpload.key,
        ]
      : [
          `${parsed.documents.resumeUpload.name}:${parsed.documents.resumeUpload.size}`,
          parsed.documents.employmentProofUpload
            ? `${parsed.documents.employmentProofUpload.name}:${parsed.documents.employmentProofUpload.size}`
            : "",
          parsed.documents.prcLicenseUpload
            ? `${parsed.documents.prcLicenseUpload.name}:${parsed.documents.prcLicenseUpload.size}`
            : "",
          parsed.documents.endorsementUpload
            ? `${parsed.documents.endorsementUpload.name}:${parsed.documents.endorsementUpload.size}`
            : "",
          parsed.documents.certificateUpload
            ? `${parsed.documents.certificateUpload.name}:${parsed.documents.certificateUpload.size}`
            : "",
          parsed.documents.membershipPaymentProof
            ? `${parsed.documents.membershipPaymentProof.name}:${parsed.documents.membershipPaymentProof.size}`
            : "",
          parsed.documents.shirtIdPaymentProof
            ? `${parsed.documents.shirtIdPaymentProof.name}:${parsed.documents.shirtIdPaymentProof.size}`
            : "",
          `${parsed.documents.photoUpload.name}:${parsed.documents.photoUpload.size}`,
        ]

  const payload = JSON.stringify({
    email: parsed.values.email,
    membershipType: parsed.values.membershipType,
    paymentCategory: parsed.values.paymentCategory,
    dateOfBirth: parsed.values.dateOfBirth.toISOString(),
    dateOfRegistration: parsed.values.dateOfRegistration.toISOString(),
    organization: parsed.values.organization,
    documents: documentSignature,
  })

  return createHash("sha256").update(payload).digest("hex")
}

function isSubmissionFingerprintConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("submissionFingerprint")
  )
}

async function findExistingSubmission(
  submissionFingerprint: string
): Promise<ExistingSubmissionResult | null> {
  const existing = await prisma.membershipApplication.findUnique({
    where: {
      submissionFingerprint,
    },
    select: {
      id: true,
      applicationNumber: true,
      status: true,
    },
  })

  if (!existing) {
    return null
  }

  return {
    applicationId: existing.id,
    applicationNumber: existing.applicationNumber,
    status: existing.status,
  }
}

async function findExistingSubmissionByEmail(
  email: string
): Promise<ExistingSubmissionResult | null> {
  const existing = await prisma.membershipApplication.findFirst({
    where: {
      email,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      applicationNumber: true,
      status: true,
    },
  })

  if (!existing) {
    return null
  }

  return {
    applicationId: existing.id,
    applicationNumber: existing.applicationNumber,
    status: existing.status,
  }
}

function buildExistingSubmissionResponse(existing: ExistingSubmissionResult) {
  return {
    ok: false as const,
    status: 409,
    code: "ALREADY_APPLIED",
    applicationId: existing.applicationId,
    applicationNumber: existing.applicationNumber,
    membershipStatus: existing.status,
    loginPath: "/member/login",
    message:
      "We already have a membership application for this email. Please sign in to your member profile to check your status or upload any missing documents there.",
  }
}

function getFullName(values: {
  firstName: string
  middleName?: string
  lastName: string
}) {
  return [values.firstName, values.middleName, values.lastName]
    .filter(Boolean)
    .join(" ")
}

function toStoredUpload(file: MembershipUploadedFile): StoredUpload {
  return {
    originalName: file.name,
    storedName: file.key,
    storagePath: file.ufsUrl,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  }
}

function requiresMembershipFeeProof(paymentCategory: string | null) {
  return paymentCategory !== "WAIVED_FREE_MEMBERSHIP"
}

function getUploadedDocumentTypeSet(application: {
  documents: Array<{ type: string }>
}) {
  return new Set(application.documents.map((document) => document.type))
}

function hasMembershipFeeProof(uploaded: Set<string>) {
  return (
    uploaded.has("PAYMENT_PROOF") || uploaded.has("MEMBERSHIP_PAYMENT_PROOF")
  )
}

function hasShirtIdFeeProof(uploaded: Set<string>) {
  return uploaded.has("PAYMENT_PROOF") || uploaded.has("SHIRT_ID_PAYMENT_PROOF")
}

export function formatPaymentCategory(category: string) {
  switch (category) {
    case "WAIVED_FREE_MEMBERSHIP":
      return "Waived / Free Membership"
    case "REGULAR_ANNUAL_MEMBERSHIP":
      return "Regular (Annual) Membership"
    case "LIFETIME_NO_ANNUAL_MEMBERSHIP":
      return "Lifetime (No Annual) Membership"
    default:
      return category
  }
}

export function getPaymentCategoryAmountLabel(category: string) {
  switch (category) {
    case "WAIVED_FREE_MEMBERSHIP":
      return "PHP 0"
    case "REGULAR_ANNUAL_MEMBERSHIP":
      return "PHP 500"
    case "LIFETIME_NO_ANNUAL_MEMBERSHIP":
      return "PHP 3,000"
    default:
      return category
  }
}

export function getApplicationPaymentProofStatus(application: {
  paymentCategory: string | null
  documents: Array<{ type: string }>
}) {
  const uploaded = getUploadedDocumentTypeSet(application)
  const membershipProofRequired = requiresMembershipFeeProof(
    application.paymentCategory
  )
  const membershipProofReceived = membershipProofRequired
    ? hasMembershipFeeProof(uploaded)
    : true
  const shirtIdProofReceived = hasShirtIdFeeProof(uploaded)

  return {
    membershipProofRequired,
    membershipProofReceived,
    shirtIdProofReceived,
    isComplete: membershipProofReceived && shirtIdProofReceived,
  }
}

function buildMissingPaymentProofMessage(application: {
  paymentCategory: string | null
  documents: Array<{ type: string }>
}) {
  const paymentStatus = getApplicationPaymentProofStatus(application)
  const missingLabels: string[] = []

  if (
    paymentStatus.membershipProofRequired &&
    !paymentStatus.membershipProofReceived
  ) {
    missingLabels.push("membership fee proof")
  }

  if (!paymentStatus.shirtIdProofReceived) {
    missingLabels.push("T-Shirt and ID proof")
  }

  if (missingLabels.length === 0) {
    return "All required payment proofs have been uploaded."
  }

  return `Missing ${missingLabels.join(" and ")}.`
}

function getApplicationSubmissionStatus(input: {
  paymentCategory: PaymentCategoryValue
  documents: Array<{ type: string }>
}): MembershipStatusValue {
  return getApplicationPaymentProofStatus(input).isComplete
    ? "PENDING"
    : "NO_PROOF_OF_PAYMENT"
}

export function formatMembershipStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending Review"
    case "NO_PROOF_OF_PAYMENT":
      return "No Proof of Payment"
    case "FOLLOW_UP":
      return "Follow Up Needed"
    case "APPROVED":
      return "Approved"
    case "REJECTED":
      return "Rejected"
    default:
      return status
  }
}

export type MembershipCommunityStats = {
  approvedMembers: number
  approvedRegularMembers: number
  freeRegularMembershipLimit: number
  freeRegularMembershipUsed: number
  freeRegularMembershipRemaining: number
  freeRegularMembershipAvailable: boolean
}

async function countDistinctMembers(
  where: Prisma.MembershipApplicationWhereInput
) {
  const members = await prisma.membershipApplication.findMany({
    where,
    distinct: ["userId"],
    select: {
      userId: true,
    },
  })

  return members.length
}

export async function getMembershipCommunityStats(): Promise<MembershipCommunityStats> {
  const [approvedMembers, approvedRegularMembers] = await Promise.all([
    countDistinctMembers({
      status: "APPROVED",
    }),
    countDistinctMembers({
      status: "APPROVED",
      membershipType: "REGULAR",
    }),
  ])

  const freeRegularMembershipUsed = Math.min(
    approvedRegularMembers,
    REGULAR_MEMBERSHIP_WAIVER_LIMIT
  )
  const freeRegularMembershipRemaining = Math.max(
    REGULAR_MEMBERSHIP_WAIVER_LIMIT - approvedRegularMembers,
    0
  )

  return {
    approvedMembers,
    approvedRegularMembers,
    freeRegularMembershipLimit: REGULAR_MEMBERSHIP_WAIVER_LIMIT,
    freeRegularMembershipUsed,
    freeRegularMembershipRemaining,
    freeRegularMembershipAvailable: freeRegularMembershipRemaining > 0,
  }
}

export function formatMembershipType(type: string) {
  switch (type) {
    case "REGULAR":
      return "Regular Member"
    case "LIFETIME":
      return "Lifetime Member"
    case "HONORARY":
      return "Honorary Member"
    default:
      return type
  }
}

export function formatPaymentMode(mode: string) {
  switch (mode) {
    case "BANK_TRANSFER":
      return "Bank Transfer"
    case "GCASH":
      return "GCash"
    case "MAYA":
      return "Maya"
    case "QR_CODE":
      return "QR Code"
    default:
      return mode.charAt(0) + mode.slice(1).toLowerCase()
  }
}

export function getStatusTone(status: string) {
  switch (status) {
    case "APPROVED":
      return "success"
    case "NO_PROOF_OF_PAYMENT":
    case "FOLLOW_UP":
      return "warning"
    case "REJECTED":
      return "danger"
    default:
      return "info"
  }
}

export function getApplicationRequirementChecklist(application: {
  membershipType: string
  paymentCategory: string | null
  prcLicense: string | null
  isConventionAttendee: boolean
  documents: Array<{ type: string }>
}) {
  const uploaded = getUploadedDocumentTypeSet(application)
  const paymentStatus = getApplicationPaymentProofStatus(application)

  return [
    {
      label: "CV / Resume",
      satisfied: uploaded.has("RESUME"),
    },
    {
      label: "Proof of employment or leadership role",
      satisfied:
        application.membershipType === "HONORARY" ||
        uploaded.has("EMPLOYMENT_PROOF"),
    },
    {
      label: "Recommendation / endorsement",
      satisfied:
        application.membershipType !== "HONORARY" ||
        uploaded.has("ENDORSEMENT"),
    },
    {
      label: "Certificate of participation / attendance",
      satisfied:
        !application.isConventionAttendee ||
        uploaded.has("ATTENDANCE_CERTIFICATE"),
    },
    {
      label: `${formatPaymentCategory(application.paymentCategory ?? "WAIVED_FREE_MEMBERSHIP")} payment proof`,
      satisfied: paymentStatus.membershipProofReceived,
      optional: !paymentStatus.membershipProofRequired,
    },
    {
      label: "T-Shirt and ID payment proof",
      satisfied: paymentStatus.shirtIdProofReceived,
    },
    {
      label: "2x2 ID photo",
      satisfied: uploaded.has("ID_PHOTO"),
    },
    {
      label: "PRC license copy",
      satisfied:
        !application.prcLicense ||
        application.prcLicense.trim().length === 0 ||
        uploaded.has("PRC_LICENSE"),
      optional: !application.prcLicense,
    },
  ]
}

function parseUploadedMemberDocument(
  value: unknown,
  fieldName: string,
  label: string,
  allowedMimeTypes: Set<string>,
  errors: Record<string, string>
) {
  if (value == null) {
    return null
  }

  if (!isRecord(value)) {
    errors[fieldName] = `${label} is invalid. Please upload the file again.`
    return null
  }

  const key = typeof value.key === "string" ? value.key : ""
  const name = typeof value.name === "string" ? value.name : ""
  const type = typeof value.type === "string" ? value.type : ""
  const ufsUrl = typeof value.ufsUrl === "string" ? value.ufsUrl : ""
  const size = typeof value.size === "number" ? value.size : NaN

  if (!key || !name || !type || !ufsUrl || !Number.isFinite(size)) {
    errors[fieldName] = `${label} is invalid. Please upload the file again.`
    return null
  }

  if (size > MAX_UPLOAD_BYTES) {
    errors[fieldName] = `${label} must be smaller than 8MB.`
    return null
  }

  if (!allowedMimeTypes.has(type)) {
    errors[fieldName] = `${label} must match the allowed file types.`
    return null
  }

  return {
    key,
    name,
    size,
    type,
    ufsUrl,
  } satisfies MembershipUploadedFile
}

export async function updateMembershipApplicationDocumentsForMember(
  userId: string,
  input: unknown
): Promise<MemberDocumentUpdateResult> {
  if (!isRecord(input)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid document update payload.",
    }
  }

  const applicationId =
    typeof input.applicationId === "string" ? input.applicationId.trim() : ""

  if (!applicationId) {
    return {
      ok: false,
      status: 400,
      message: "Missing application reference.",
    }
  }

  const application = await prisma.membershipApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    include: {
      documents: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!application) {
    return {
      ok: false,
      status: 404,
      message: "We could not find that membership application.",
    }
  }

  const errors: Record<string, string> = {}
  const updates = memberDocumentFieldDefinitions
    .map((definition) => {
      const file = parseUploadedMemberDocument(
        input[definition.fieldName],
        definition.fieldName,
        definition.label,
        definition.allowedMimeTypes,
        errors
      )

      if (!file) {
        return null
      }

      return {
        ...definition,
        file,
      }
    })
    .filter((value): value is MemberDocumentUpdateItem => value !== null)

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      status: 400,
      message: "Please review the highlighted document uploads and try again.",
      errors,
    }
  }

  if (updates.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "Choose at least one document to upload before saving.",
    }
  }

  const uploadedKeys = updates.map((update) => update.file.key)
  const replacedKeys: string[] = []
  const documentMap = new Map(
    application.documents.map((document) => [document.type, document])
  )
  const uploadedPaymentProof = updates.some(
    (update) =>
      update.type === "PAYMENT_PROOF" ||
      update.type === "MEMBERSHIP_PAYMENT_PROOF" ||
      update.type === "SHIRT_ID_PAYMENT_PROOF"
  )
  const expectedDocumentTypes = new Set(
    application.documents.map((document) => document.type)
  )

  for (const update of updates) {
    expectedDocumentTypes.add(update.type)
  }

  if (updates.some((update) => update.type === "PAYMENT_PROOF")) {
    expectedDocumentTypes.add("MEMBERSHIP_PAYMENT_PROOF")
    expectedDocumentTypes.add("SHIRT_ID_PAYMENT_PROOF")
  }

  const shouldMoveBackToPending =
    application.status === "NO_PROOF_OF_PAYMENT" &&
    uploadedPaymentProof &&
    getApplicationPaymentProofStatus({
      paymentCategory: application.paymentCategory,
      documents: Array.from(expectedDocumentTypes, (type) => ({ type })),
    }).isComplete
  const stillMissingPaymentProof =
    application.status === "NO_PROOF_OF_PAYMENT" &&
    uploadedPaymentProof &&
    !shouldMoveBackToPending

  try {
    await prisma.$transaction([
      ...updates.map((update) => {
        const existingDocument = documentMap.get(update.type)

        if (
          existingDocument &&
          existingDocument.storedName !== update.file.key
        ) {
          replacedKeys.push(existingDocument.storedName)
        }

        if (existingDocument) {
          return prisma.membershipDocument.update({
            where: {
              id: existingDocument.id,
            },
            data: {
              label: update.label,
              originalName: update.file.name,
              storedName: update.file.key,
              storagePath: update.file.ufsUrl,
              mimeType: update.file.type || "application/octet-stream",
              sizeBytes: update.file.size,
            },
          })
        }

        return prisma.membershipDocument.create({
          data: {
            applicationId: application.id,
            type: update.type,
            label: update.label,
            originalName: update.file.name,
            storedName: update.file.key,
            storagePath: update.file.ufsUrl,
            mimeType: update.file.type || "application/octet-stream",
            sizeBytes: update.file.size,
          },
        })
      }),
      prisma.membershipApplication.update({
        where: {
          id: application.id,
        },
        data: {
          ...(shouldMoveBackToPending
            ? {
                status: "PENDING",
                followUpMessage: null,
                lastFollowUpSentAt: null,
              }
            : {}),
          reviewSummary: application.reviewSummary ?? null,
        },
      }),
      ...(shouldMoveBackToPending
        ? [
            prisma.membershipReviewAction.create({
              data: {
                applicationId: application.id,
                reviewerId: null,
                type: "SUBMITTED",
                subject: PAYMENT_PROOF_RECEIVED_REVIEW_SUBJECT,
                message:
                  "Member uploaded the remaining required payment proof from the profile page. The application has been returned to pending review.",
              },
            }),
          ]
        : []),
    ])
  } catch (error) {
    if (uploadedKeys.length > 0) {
      try {
        await utapi.deleteFiles(uploadedKeys)
      } catch (cleanupError) {
        console.error(
          "Failed to clean up UploadThing files after document update failure:",
          cleanupError
        )
      }
    }

    throw error
  }

  if (replacedKeys.length > 0) {
    try {
      await utapi.deleteFiles(replacedKeys)
    } catch (cleanupError) {
      console.error(
        "Failed to clean up replaced UploadThing files after document update:",
        cleanupError
      )
    }
  }

  return {
    ok: true,
    message: shouldMoveBackToPending
      ? "Your required payment proof has been saved. Your application is back in the pending review queue."
      : stillMissingPaymentProof
        ? "Your upload has been saved, but your application still needs the remaining required payment proof or proofs."
        : updates.length === 1
          ? "Your document has been saved to your membership profile."
          : "Your updated documents have been saved to your membership profile.",
    updatedDocuments: updates.map((update) => update.label),
  }
}

export async function createMembershipApplication(input: FormData | unknown) {
  const parsed =
    input instanceof FormData
      ? parseLegacyMembershipApplication(input)
      : parseUploadedMembershipApplication(input)

  if (!parsed.ok) {
    return {
      ok: false as const,
      status: 400,
      errors: parsed.errors,
    }
  }

  const existingApplication = await findExistingSubmissionByEmail(
    parsed.values.email
  )

  if (existingApplication) {
    return buildExistingSubmissionResponse(existingApplication)
  }

  const submissionFingerprint = buildSubmissionFingerprint(parsed)
  const existingSubmission = await findExistingSubmission(submissionFingerprint)

  if (existingSubmission) {
    return buildExistingSubmissionResponse(existingSubmission)
  }

  const applicationId = randomUUID()
  const applicationNumber = await allocateNextApplicationNumber(
    new Date().getFullYear()
  )
  const fullName = getFullName(parsed.values)

  const user = await prisma.user.upsert({
    where: {
      email: parsed.values.email,
    },
    update: {
      name: fullName,
    },
    create: {
      email: parsed.values.email,
      name: fullName,
      role: "MEMBER",
    },
  })

  const storedDocuments: StoredMembershipDocument[] = []
  const submissionReviewActions: Array<{
    reviewerId: string | null
    type: ReviewActionType
    subject: string
    message: string
  }> = [
    {
      reviewerId: null,
      type: "SUBMITTED",
      subject: "Application submitted",
      message: "Member submitted a new membership application.",
    },
  ]

  try {
    const applicationStatus = getApplicationSubmissionStatus({
      paymentCategory: parsed.values.paymentCategory,
      documents: [
        ...(parsed.documents.membershipPaymentProof
          ? [{ type: "MEMBERSHIP_PAYMENT_PROOF" as const }]
          : []),
        ...(parsed.documents.shirtIdPaymentProof
          ? [{ type: "SHIRT_ID_PAYMENT_PROOF" as const }]
          : []),
      ],
    })

    if (parsed.source === "legacy") {
      storedDocuments.push({
        ...(await saveUploadedFile({
          applicationId,
          file: parsed.documents.resumeUpload,
          prefix: "resume",
        })),
        type: "RESUME",
        label: "CV / Resume",
      })

      if (parsed.documents.employmentProofUpload) {
        storedDocuments.push({
          ...(await saveUploadedFile({
            applicationId,
            file: parsed.documents.employmentProofUpload,
            prefix: "employment-proof",
          })),
          type: "EMPLOYMENT_PROOF",
          label: "Proof of Employment / Leadership Role",
        })
      }

      if (parsed.documents.prcLicenseUpload) {
        storedDocuments.push({
          ...(await saveUploadedFile({
            applicationId,
            file: parsed.documents.prcLicenseUpload,
            prefix: "prc-license",
          })),
          type: "PRC_LICENSE",
          label: "PRC License Copy",
        })
      }

      if (parsed.documents.endorsementUpload) {
        storedDocuments.push({
          ...(await saveUploadedFile({
            applicationId,
            file: parsed.documents.endorsementUpload,
            prefix: "endorsement",
          })),
          type: "ENDORSEMENT",
          label: "Recommendation / Endorsement",
        })
      }

      if (parsed.documents.certificateUpload) {
        storedDocuments.push({
          ...(await saveUploadedFile({
            applicationId,
            file: parsed.documents.certificateUpload,
            prefix: "attendance-certificate",
          })),
          type: "ATTENDANCE_CERTIFICATE",
          label: "Attendance Certificate",
        })
      }

      if (parsed.documents.membershipPaymentProof) {
        storedDocuments.push({
          ...(await saveUploadedFile({
            applicationId,
            file: parsed.documents.membershipPaymentProof,
            prefix: "membership-payment-proof",
          })),
          type: "MEMBERSHIP_PAYMENT_PROOF",
          label: "Membership Fee Proof of Payment",
        })
      }

      if (parsed.documents.shirtIdPaymentProof) {
        storedDocuments.push({
          ...(await saveUploadedFile({
            applicationId,
            file: parsed.documents.shirtIdPaymentProof,
            prefix: "shirt-id-payment-proof",
          })),
          type: "SHIRT_ID_PAYMENT_PROOF",
          label: "T-Shirt and ID Proof of Payment",
        })
      }

      storedDocuments.push({
        ...(await saveUploadedFile({
          applicationId,
          file: parsed.documents.photoUpload,
          prefix: "id-photo",
        })),
        type: "ID_PHOTO",
        label: "2x2 ID Photo",
      })
    } else {
      storedDocuments.push({
        ...toStoredUpload(parsed.documents.resumeUpload),
        type: "RESUME",
        label: "CV / Resume",
      })

      if (parsed.documents.employmentProofUpload) {
        storedDocuments.push({
          ...toStoredUpload(parsed.documents.employmentProofUpload),
          type: "EMPLOYMENT_PROOF",
          label: "Proof of Employment / Leadership Role",
        })
      }

      if (parsed.documents.prcLicenseUpload) {
        storedDocuments.push({
          ...toStoredUpload(parsed.documents.prcLicenseUpload),
          type: "PRC_LICENSE",
          label: "PRC License Copy",
        })
      }

      if (parsed.documents.endorsementUpload) {
        storedDocuments.push({
          ...toStoredUpload(parsed.documents.endorsementUpload),
          type: "ENDORSEMENT",
          label: "Recommendation / Endorsement",
        })
      }

      if (parsed.documents.certificateUpload) {
        storedDocuments.push({
          ...toStoredUpload(parsed.documents.certificateUpload),
          type: "ATTENDANCE_CERTIFICATE",
          label: "Attendance Certificate",
        })
      }

      if (parsed.documents.membershipPaymentProof) {
        storedDocuments.push({
          ...toStoredUpload(parsed.documents.membershipPaymentProof),
          type: "MEMBERSHIP_PAYMENT_PROOF",
          label: "Membership Fee Proof of Payment",
        })
      }

      if (parsed.documents.shirtIdPaymentProof) {
        storedDocuments.push({
          ...toStoredUpload(parsed.documents.shirtIdPaymentProof),
          type: "SHIRT_ID_PAYMENT_PROOF",
          label: "T-Shirt and ID Proof of Payment",
        })
      }

      storedDocuments.push({
        ...toStoredUpload(parsed.documents.photoUpload),
        type: "ID_PHOTO",
        label: "2x2 ID Photo",
      })
    }

    if (applicationStatus === "NO_PROOF_OF_PAYMENT") {
      submissionReviewActions.push({
        reviewerId: null,
        type: "SUBMITTED",
        subject: NO_PROOF_OF_PAYMENT_REVIEW_SUBJECT,
        message: `${buildMissingPaymentProofMessage({
          paymentCategory: parsed.values.paymentCategory,
          documents: storedDocuments.map((document) => ({
            type: document.type,
          })),
        })} The member can still upload the missing payment proof or proofs later from the member profile page.`,
      })
    }

    await prisma.membershipApplication.create({
      data: {
        id: applicationId,
        applicationNumber,
        submissionFingerprint,
        userId: user.id,
        status: applicationStatus,
        ...parsed.values,
        documents: {
          create: storedDocuments,
        },
        reviewActions: {
          create: submissionReviewActions,
        },
      },
    })
  } catch (error) {
    if (isSubmissionFingerprintConflict(error)) {
      if (parsed.source === "legacy") {
        await removeApplicationStorage(applicationId)
      }

      const concurrentSubmission = await findExistingSubmission(
        submissionFingerprint
      )

      if (concurrentSubmission) {
        return buildExistingSubmissionResponse(concurrentSubmission)
      }
    }

    if (parsed.source === "legacy") {
      await removeApplicationStorage(applicationId)
    } else {
      const uploadedKeys = storedDocuments
        .map((document) => document.storedName)
        .filter(Boolean)

      if (uploadedKeys.length > 0) {
        try {
          await utapi.deleteFiles(uploadedKeys)
        } catch (cleanupError) {
          console.error("Failed to clean up UploadThing files:", cleanupError)
        }
      }
    }

    throw error
  }

  const magicLinkResult = await requestMagicLink({
    applicationId,
    email: user.email,
    recipientName: user.name ?? undefined,
    scope: "MEMBER",
    userId: user.id,
  })

  if (!magicLinkResult.ok) {
    return {
      ok: true as const,
      applicationId,
      applicationNumber,
      emailSent: false,
      debugUrl: undefined,
      message: `Your application was saved, but we couldn't send the member sign-in email yet. ${magicLinkResult.message}`,
    }
  }

  return {
    ok: true as const,
    applicationId,
    applicationNumber,
    emailSent: magicLinkResult.emailSent,
    debugUrl: magicLinkResult.debugUrl,
    message: magicLinkResult.message,
  }
}
