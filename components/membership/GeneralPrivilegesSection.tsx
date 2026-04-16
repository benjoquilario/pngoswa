import { generalPrivileges } from "./data";
import { CheckIcon } from "./icons";

export function GeneralPrivilegesSection() {
  return (
    <section className="section-py" style={{ background: "var(--surface)" }}>
      <div className="container" style={{ maxWidth: "56rem" }}>
        <span className="section-label">Section III</span>
        <h2 className="section-title">General Membership Privileges</h2>
        <p className="section-desc" style={{ marginBottom: "1.5rem" }}>
          All membership categories enjoy the following benefits:
        </p>
        <div className="priv-grid">
          {generalPrivileges.map((privilege, index) => (
            <div key={index} className="priv-item">
              <span className="priv-check">
                <CheckIcon />
              </span>
              <span>{privilege}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
