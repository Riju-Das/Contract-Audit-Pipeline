import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export function NotFound() {
    return (
        <div className="page" style={{ maxWidth: 520, margin: "0 auto" }}>
            <h1 className="page-title">Page not found</h1>
            <p>The requested page does not exist.</p>
            <Link to="/app/contracts">
                <Button>Back to contracts</Button>
            </Link>
        </div>
    );
}
