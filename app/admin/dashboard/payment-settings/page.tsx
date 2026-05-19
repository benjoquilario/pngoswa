import { PaymentSettingsForm } from "@/components/admin/payment-settings-form"
import { getPublicPaymentSettings } from "@/lib/payment-settings"

export default async function AdminPaymentSettingsPage() {
  const paymentSettings = await getPublicPaymentSettings()

  return (
    <div className="dashboard-content">
      <section className="dashboard-hero">
        <div>
          <span className="section-label">Configuration</span>
          <h1 className="dashboard-title">Payment settings</h1>
          <p className="dashboard-copy">
            Manage the payment numbers, QR code, and privacy message shown to
            membership applicants.
          </p>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading-row">
          <div>
            <p className="panel-kicker">Applicant payments</p>
            <h2 className="dashboard-section-title">
              Membership payment configuration
            </h2>
          </div>
        </div>
        <PaymentSettingsForm initialSettings={paymentSettings} />
      </section>
    </div>
  )
}
