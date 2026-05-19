import Link from "next/link"
import { notFound } from "next/navigation"

import { reviewMembershipAction } from "@/app/admin/actions"
import { ReviewMembershipActionForm } from "@/components/admin/review-membership-action-form"
import { StatusBadge } from "@/components/portal/status-badge"
import { requirePortalSession } from "@/lib/auth"
import { isPresidentAdminEmail } from "@/lib/auth/admin-access"
import { prisma } from "@/lib/db"
import { formatOfficerRoleName } from "@/lib/officer-roles"
import {
  formatPaymentCategory,
  formatMembershipType,
  formatPaymentMode,
  getApplicationPaymentProofStatus,
  getApplicationRequirementChecklist,
  getApplicationRequirementReviewItems,
} from "@/lib/membership"

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  const session = await requirePortalSession("ADMIN")
  const { id } = await params
  const query = await searchParams
  const canAssignOfficerRole = isPresidentAdminEmail(session.user.email)
  const application = await prisma.membershipApplication.findUnique({
    where: {
      id,
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
        include: {
          reviewer: true,
        },
      },
    },
  })

  if (!application) {
    notFound()
  }

  const checklist = getApplicationRequirementChecklist(application)
  const paymentProofStatus = getApplicationPaymentProofStatus(application)
  const requirementReviewItems = getApplicationRequirementReviewItems(application)

  return (
    <div className="dashboard-content">
      <section className="dashboard-hero dashboard-hero-tight">
        <div>
          <Link href="/admin/dashboard" className="back-link">
            Back to dashboard
          </Link>
          <div className="panel-heading-row">
            <div>
              <span className="section-label">Application Review</span>
              <h1 className="dashboard-title">
                {application.firstName} {application.lastName}
              </h1>
              <p className="dashboard-copy">{application.applicationNumber}</p>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </div>
      </section>

      {query.updated ? (
        <div className="form-feedback form-feedback-success">
          <p>Application updated successfully.</p>
        </div>
      ) : null}

      {application.status === "NO_PROOF_OF_PAYMENT" ? (
        <div className="form-feedback form-feedback-warning">
          <strong>No proof of payment yet</strong>
          <p>
            This application is still missing required payment proof. The
            member can upload the remaining file later from the member profile
            page.
          </p>
          <p>
            Membership fee proof:{" "}
            {paymentProofStatus.membershipProofRequired
              ? paymentProofStatus.membershipProofReceived
                ? "received"
                : "missing"
              : "waived / not required"}
            . T-Shirt and ID proof:{" "}
            {paymentProofStatus.shirtIdProofReceived ? "received" : "missing"}.
          </p>
        </div>
      ) : null}

      <div className="detail-grid">
        <section className="dashboard-panel">
          <h2 className="dashboard-section-title">Applicant summary</h2>
          <div className="profile-meta-grid">
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
              <strong>{formatPaymentCategory(application.paymentCategory)}</strong>
            </div>
            <div>
              <span className="profile-meta-label">Email</span>
              <strong>{application.email}</strong>
            </div>
            <div>
              <span className="profile-meta-label">Contact</span>
              <strong>{application.contactNumber}</strong>
            </div>
            <div>
              <span className="profile-meta-label">Organization</span>
              <strong>{application.organization}</strong>
            </div>
            <div>
              <span className="profile-meta-label">Position</span>
              <strong>{application.position}</strong>
            </div>
            <div>
              <span className="profile-meta-label">Region</span>
              <strong>{application.region}</strong>
            </div>
            <div>
              <span className="profile-meta-label">Submitted</span>
              <strong>{application.createdAt.toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <h2 className="dashboard-section-title">Requirement checklist</h2>
          <div className="checklist-grid">
            {checklist.map((item) => (
              <div key={item.label} className="checklist-item">
                <strong>{item.label}</strong>
                <span
                  className={
                    item.satisfied
                      ? "status-badge status-badge-success"
                      : "status-badge status-badge-warning"
                  }
                >
                  {item.satisfied ? "Received" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <h2 className="dashboard-section-title">Submitted documents</h2>
          <div className="review-doc-grid">
            {requirementReviewItems.map((item) => (
              <article
                key={item.key}
                className={
                  item.optional && item.documents.length === 0
                    ? "review-doc-card review-doc-card-optional-empty"
                    : "review-doc-card"
                }
              >
                <div className="review-doc-head">
                  <strong>{item.label}</strong>
                  <span
                    className={
                      item.satisfied
                        ? "status-badge status-badge-success"
                        : "status-badge status-badge-warning"
                    }
                  >
                    {item.satisfied ? "Received" : "Missing"}
                  </span>
                </div>
                <p className="review-doc-copy">{item.helperText}</p>
                {item.documents.length > 0 ? (
                  <div className="review-doc-links">
                    {item.documents.map((document) => (
                      <a
                        key={document.id}
                        href={`/api/documents/${document.id}`}
                        className="review-doc-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <strong>{document.label}</strong>
                        <span>{document.originalName}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p
                    className={
                      item.optional
                        ? "review-doc-empty review-doc-empty-optional"
                        : "review-doc-empty review-doc-empty-required"
                    }
                  >
                    <span className="review-doc-empty-icon" aria-hidden="true">
                      !
                    </span>
                    {item.optional
                      ? "Missing: no file uploaded for this optional requirement."
                      : "No file uploaded yet for this required item."}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <h2 className="dashboard-section-title">Review actions</h2>
          <ReviewMembershipActionForm
            actionHandler={reviewMembershipAction}
            applicationId={application.id}
            initialMessage={application.followUpMessage ?? ""}
            initialOfficerRoleName={application.officerRoleName}
            canAssignOfficerRole={canAssignOfficerRole}
          />
        </section>

        <section className="dashboard-panel detail-grid-full">
          <h2 className="dashboard-section-title">Review timeline</h2>
          <div className="timeline-list">
            {application.reviewActions.map((action) => (
              <div key={action.id} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <strong>{action.subject ?? action.type}</strong>
                  {action.message ? <p>{action.message}</p> : null}
                  <span>
                    {action.createdAt.toLocaleString()}
                    {action.reviewer?.email ? ` • ${action.reviewer.email}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
