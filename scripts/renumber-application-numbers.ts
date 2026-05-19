import "dotenv/config"

import { Pool } from "pg"

const RESERVED_OFFICER_APPLICATION_SLOTS = 10

type MembershipApplicationRow = {
  id: string
  applicationNumber: string
  createdAt: Date
  firstName: string
  lastName: string
  officerRoleName: string | null
}

function resolveConnectionString() {
  const rawUrl = process.env.DATABASE_URL

  if (!rawUrl) {
    throw new Error("DATABASE_URL is required to renumber application records.")
  }

  if (!rawUrl.startsWith("prisma+postgres://")) {
    return rawUrl
  }

  const url = new URL(rawUrl)
  const apiKey = url.searchParams.get("api_key")

  if (!apiKey) {
    throw new Error(
      "DATABASE_URL is using prisma+postgres but does not include an api_key."
    )
  }

  const decoded = Buffer.from(apiKey, "base64url").toString("utf8")
  const payload = JSON.parse(decoded) as { databaseUrl?: string }

  if (!payload.databaseUrl) {
    throw new Error("Missing databaseUrl in Prisma Postgres api_key payload.")
  }

  return payload.databaseUrl
}

function parseNumberArg(name: string, fallback: number) {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`))

  if (!arg) {
    return fallback
  }

  const value = Number(arg.split("=")[1])

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`--${name} must be a positive integer.`)
  }

  return value
}

function hasFlag(flag: string) {
  return process.argv.includes(`--${flag}`)
}

function buildApplicationNumber(year: number, sequence: number) {
  return `PNGOSWA-${year}-${String(sequence).padStart(5, "0")}`
}

async function loadApplicationsForYear(pool: Pool, year: number) {
  return pool.query<MembershipApplicationRow>(
    `
      select
        id,
        "applicationNumber",
        "createdAt",
        "firstName",
        "lastName",
        "officerRoleName"
      from "MembershipApplication"
      where "applicationNumber" like $1
      order by "createdAt" asc, id asc
    `,
    [`PNGOSWA-${year}-%`]
  )
}

async function main() {
  const year = parseNumberArg("year", new Date().getFullYear())
  const start = parseNumberArg("start", 1)
  const apply = hasFlag("apply")

  const pool = new Pool({
    connectionString: resolveConnectionString(),
  })

  try {
    const result = await loadApplicationsForYear(pool, year)
    const applications = result.rows

    if (applications.length === 0) {
      console.log(`No membership applications found for ${year}.`)
      return
    }

    const renumberPlan = applications.map((application, index) => ({
      ...application,
      newApplicationNumber: buildApplicationNumber(year, start + index),
    }))

    console.log(
      `Prepared ${renumberPlan.length} application number update(s) for ${year}, starting at ${buildApplicationNumber(
        year,
        start
      )}.`
    )
    console.table(
      renumberPlan.map((application) => ({
        current: application.applicationNumber,
        next: application.newApplicationNumber,
        name: `${application.firstName} ${application.lastName}`,
        officerRoleName: application.officerRoleName ?? "",
        createdAt: new Date(application.createdAt).toISOString(),
      }))
    )

    if (!apply) {
      console.log("")
      console.log(
        "Preview only. Re-run with --apply to write these numbers into the database."
      )
      console.log(
        "If you start from 00001, those early numbers will be consumed by existing records in production."
      )
      return
    }

    const highestAssigned = start + renumberPlan.length - 1
    const highestReservedUsed =
      start <= RESERVED_OFFICER_APPLICATION_SLOTS
        ? Math.min(highestAssigned, RESERVED_OFFICER_APPLICATION_SLOTS)
        : 0

    const client = await pool.connect()

    try {
      await client.query("BEGIN")
      await client.query('LOCK TABLE "MembershipApplication" IN EXCLUSIVE MODE')
      await client.query(
        'LOCK TABLE "ApplicationNumberSequence" IN EXCLUSIVE MODE'
      )

      for (const [index, application] of renumberPlan.entries()) {
        await client.query(
          `
            update "MembershipApplication"
            set "applicationNumber" = $1
            where id = $2
          `,
          [
            `TMP-${year}-${index + 1}-${application.id.slice(0, 8)}`,
            application.id,
          ]
        )
      }

      for (const application of renumberPlan) {
        await client.query(
          `
            update "MembershipApplication"
            set "applicationNumber" = $1
            where id = $2
          `,
          [application.newApplicationNumber, application.id]
        )
      }

      await client.query(
        `
          insert into "ApplicationNumberSequence" (
            "year",
            "lastGeneralSequence",
            "lastOfficerSequence",
            "updatedAt"
          )
          values ($1, $2, $3, now())
          on conflict ("year")
          do update set
            "lastGeneralSequence" = excluded."lastGeneralSequence",
            "lastOfficerSequence" = excluded."lastOfficerSequence",
            "updatedAt" = now()
        `,
        [year, highestAssigned, highestReservedUsed]
      )

      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }

    console.log("")
    console.log(
      `Renumbering complete. ${year} records now run through ${buildApplicationNumber(
        year,
        highestAssigned
      )}.`
    )
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error("Failed to renumber membership application numbers.")
  console.error(error)
  process.exitCode = 1
})
