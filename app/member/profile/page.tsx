import Link from "next/link"

import { logoutMember } from "@/app/member/actions"
import { MemberDocumentUpdateForm } from "@/components/portal/member-document-update-form"
import { StatusBadge } from "@/components/portal/status-badge"
import { requirePortalSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatOfficerRoleName } from "@/lib/officer-roles"
import {
  formatPaymentCategory,
  formatMembershipStatus,
  formatMembershipType,
  formatPaymentMode,
  getApplicationPaymentProofStatus,
  getApplicationRequirementChecklist,
} from "@/lib/membership"

export const dynamic = "force-dynamic"

const statusPriority: Record<string, number> = {
  APPROVED: 5,
  FOLLOW_UP: 4,
  NO_PROOF_OF_PAYMENT: 3,
  PENDING: 2,
  REJECTED: 1,
}

export default async function MemberProfilePage() {
  const session = await requirePortalSession("MEMBER")
  const applications = await prisma.membershipApplication.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      documents: {
        orderBy: {
          createdAt: "asc",
        },
      },
      reviewActions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      communications: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  const application =
    applications
      .slice()
      .sort((left, right) => {
        const priorityDifference =
          (statusPriority[right.status] ?? 0) - (statusPriority[left.status] ?? 0)

        if (priorityDifference !== 0) {
          return priorityDifference
        }

        const leftTimestamp = (
          left.approvedAt ??
          left.rejectedAt ??
          left.lastFollowUpSentAt ??
          left.updatedAt
        ).getTime()
        const rightTimestamp = (
          right.approvedAt ??
          right.rejectedAt ??
          right.lastFollowUpSentAt ??
          right.updatedAt
        ).getTime()

        return rightTimestamp - leftTimestamp
      })[0] ?? null

  const latestReviewMessage = application?.reviewActions[0]?.message
  const requirementChecklist = application
    ? getApplicationRequirementChecklist(application)
    : []
  const paymentProofStatus = application
    ? getApplicationPaymentProofStatus(application)
    : null

  return (
    <main className="portal-shell">
      <section className="portal-header">
        <div>
          <span className="section-label">Member Profile</span>
          <h1 className="portal-title">Your PNGOSWA membership status</h1>
          <p className="portal-copy">
            Signed in as <strong>{session.user.email}</strong>
          </p>
        </div>
        <form action={logoutMember}>
          <button className="btn btn-outline" type="submit">
            Sign Out
          </button>
        </form>
      </section>

      {!application ? (
        <section className="dashboard-panel">
          <h2 className="dashboard-section-title">No application found yet</h2>
          <p className="portal-copy">
            We don&apos;t have a saved membership application for this account yet.
          </p>
          <Link className="btn btn-cta" href="/membership/apply">
            Complete membership application
          </Link>
        </section>
      ) : (
        <div className="portal-grid">
          <section className="dashboard-panel">
            <div className="panel-heading-row">
              <div>
                <p className="panel-kicker">Application Reference</p>
                <h2 className="dashboard-section-title">
                  {application.applicationNumber}
                </h2>
              </div>
              <StatusBadge status={application.status} />
            </div>
            <div className="profile-meta-grid">
              <div>
                <span className="profile-meta-label">Profile Status</span>
                <strong>{formatMembershipStatus(application.status)}</strong>
              </div>
              <div>
                <span className="profile-meta-label">Membership Type</span>
                <strong>{formatMembershipType(application.membershipType)}</strong>
              </div>
              <div>
                <span className="profile-meta-label">Assigned Role</span>
                <strong>{formatOfficerRoleName(application.officerRoleName)}</strong>
              </div>
              <div>
                <span className="profile-meta-label">Payment Mode</span>
                <strong>{formatPaymentMode(application.paymentMode)}</strong>
              </div>
              <div>
                <span className="profile-meta-label">Membership Payment</span>
                <strong>
                  {formatPaymentCategory(application.paymentCategory)}
                </strong>
              </div>
              <div>
                <span className="profile-meta-label">Organization</span>
                <strong>{application.organization}</strong>
              </div>
              <div>
                <span className="profile-meta-label">Submitted</span>
                <strong>{application.createdAt.toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="profile-meta-label">Last Updated</span>
                <strong>{application.updatedAt.toLocaleString()}</strong>
              </div>
              {application.approvedAt ? (
                <div>
                  <span className="profile-meta-label">Approved On</span>
                  <strong>{application.approvedAt.toLocaleString()}</strong>
                </div>
              ) : null}
            </div>

            {application.status === "APPROVED" ? (
              <div className="form-feedback form-feedback-success">
                <strong>Membership approved</strong>
                <p>
                  Your membership is now active in your PNGOSWA member profile.
                </p>
                {application.officerRoleName ? (
                  <p>
                    Assigned role:{" "}
                    {formatOfficerRoleName(application.officerRoleName)}.
                  </p>
                ) : null}
                {application.approvedAt ? (
                  <p>Approved on {application.approvedAt.toLocaleString()}.</p>
                ) : null}
              </div>
            ) : null}

            {application.followUpMessage ? (
              <div className="form-feedback form-feedback-warning">
                <strong>Action needed from you</strong>
                <p>{application.followUpMessage}</p>
              </div>
            ) : null}

            {application.status === "NO_PROOF_OF_PAYMENT" ? (
              <div className="form-feedback form-feedback-warning">
                <strong>Proof of payment still needed</strong>
                <p>
                  Your application was submitted successfully, but some payment
                  proof is still missing. Please upload the remaining required
                  proof below from your member profile so PNGOSWA officers can
                  continue the review.
                </p>
                {paymentProofStatus ? (
                  <p>
                    Membership fee proof:{" "}
                    {paymentProofStatus.membershipProofRequired
                      ? paymentProofStatus.membershipProofReceived
                        ? "received"
                        : "missing"
                      : "waived / not required"}
                    . T-Shirt and ID proof:{" "}
                    {paymentProofStatus.shirtIdProofReceived
                      ? "received"
                      : "missing"}
                    .
                  </p>
                ) : null}
              </div>
            ) : null}

            {application.status === "REJECTED" ? (
              <div className="form-feedback form-feedback-error">
                <strong>Application not approved</strong>
                <p>
                  {latestReviewMessage ||
                    "Your latest application was not approved. Please contact PNGOSWA if you need clarification."}
                </p>
              </div>
            ) : null}
          </section>

          <section className="dashboard-panel">
            <h2 className="dashboard-section-title">Submitted documents</h2>
            {application.documents.length > 0 ? (
              <div className="doc-list">
                {application.documents.map((document) => (
                  <a
                    key={document.id}
                    href={`/api/documents/${document.id}`}
                    className="doc-card"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <strong>{document.label}</strong>
                    <span>{document.originalName}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="portal-empty-copy">
                No supporting documents are attached to this membership record yet.
              </p>
            )}
          </section>

          <section className="dashboard-panel">
            <h2 className="dashboard-section-title">Requirement checklist</h2>
            <div className="checklist-grid">
              {requirementChecklist.map((item) => (
                <div key={item.label} className="checklist-item">
                  <strong>{item.label}</strong>
                  <span
                    className={
                      item.satisfied
                        ? "status-badge status-badge-success"
                        : item.optional
                          ? "status-badge status-badge-info"
                          : "status-badge status-badge-warning"
                    }
                  >
                    {item.satisfied
                      ? "Received"
                      : item.optional
                        ? "Optional"
                        : "Missing"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <h2 className="dashboard-section-title">Review timeline</h2>
            {application.reviewActions.length > 0 ? (
              <div className="timeline-list">
                {application.reviewActions.map((action) => (
                  <div key={action.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div>
                      <strong>{action.subject ?? action.type}</strong>
                      {action.message ? <p>{action.message}</p> : null}
                      <span>{action.createdAt.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="portal-empty-copy">
                Review history will appear here once PNGOSWA processes your record.
              </p>
            )}
          </section>

          <section className="dashboard-panel">
            <h2 className="dashboard-section-title">Communication log</h2>
            {application.communications.length > 0 ? (
              <div className="timeline-list">
                {application.communications.map((communication) => (
                  <div key={communication.id} className="timeline-item">
                    <div className="timeline-dot timeline-dot-muted" />
                    <div>
                      <strong>{communication.subject}</strong>
                      <p>{communication.previewText}</p>
                      {communication.errorMessage ? (
                        <p className="portal-log-error">
                          Delivery note: {communication.errorMessage}
                        </p>
                      ) : null}
                      <span>
                        {communication.status} at{" "}
                        {communication.createdAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="portal-empty-copy">
                Email and follow-up activity will appear here after PNGOSWA sends
                updates about your application.
              </p>
            )}
          </section>

          <section className="dashboard-panel detail-grid-full">
            <h2 className="dashboard-section-title">
              Upload missing or replacement documents
            </h2>
            <MemberDocumentUpdateForm
              applicationId={application.id}
              membershipType={application.membershipType}
              paymentCategory={application.paymentCategory}
              isConventionAttendee={application.isConventionAttendee}
              hasPrcLicense={Boolean(application.prcLicense?.trim())}
              existingDocumentTypes={application.documents.map(
                (document) => document.type
              )}
            />
          </section>
        </div>
      )}
    </main>
  )
}
