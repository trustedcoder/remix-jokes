export default function LoginRoute(){
    return (
        <div>
            <h1>Login</h1>
            <form method="post">
                <div>
                <label>
                    Username: <input type="text" name="username" />
                </label>
                </div>
                <div>
                <label>
                    Password: <input type="password" name="password" />
                </label>
                </div>
                <div>
                <button type="submit" className="button">
                    Submit
                </button>
                </div>
            </form>
        </div>
    )
}