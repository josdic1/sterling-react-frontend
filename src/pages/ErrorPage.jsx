import { useRouteError, useNavigate } from "react-router-dom";

export function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    return (
        <div className="error-container">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p><i>{error.statusText || error.message}</i></p>
            <button onClick={() => navigate('/')}>Go Home</button>
        </div>
    );
}