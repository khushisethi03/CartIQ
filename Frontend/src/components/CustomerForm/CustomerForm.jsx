import './CustomerForm.css';

const PHONE_REGEX = /^[6-9]\d{9}$/;

const CustomerForm = ({ customerName, mobileNumber, setMobileNumber, setCustomerName }) => {
    const phoneError =
        mobileNumber && !PHONE_REGEX.test(mobileNumber)
            ? "Enter a valid 10-digit mobile number"
            : "";

    return (
        <div className="cuf-wrapper">
            <div className="cuf-section-title">
                <i className="bi bi-person-lines-fill me-1"></i>Customer Details
            </div>

            <div className="cuf-field">
                <label className="cuf-label">
                    <i className="bi bi-person"></i>Name
                </label>
                <input
                    type="text"
                    className="cuf-input"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />
            </div>

            <div className="cuf-field">
                <label className="cuf-label">
                    <i className="bi bi-phone"></i>Mobile
                </label>
                <input
                    type="text"
                    className={`cuf-input ${
                        phoneError
                            ? "cuf-input-error"
                            : mobileNumber && PHONE_REGEX.test(mobileNumber)
                            ? "cuf-input-valid"
                            : ""
                    }`}
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) setMobileNumber(val);
                    }}
                />
                {phoneError && (
                    <span className="cuf-error">
                        <i className="bi bi-exclamation-circle-fill"></i>{phoneError}
                    </span>
                )}
            </div>
        </div>
    );
};

export default CustomerForm;
