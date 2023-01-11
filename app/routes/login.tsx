import { Link, useActionData, useSearchParams } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { json } from "@remix-run/node";
import type {ActionArgs, MetaFunction} from "@remix-run/node";
import { createUserSession, login, register } from "~/utils/session.server";


function validateUsername(username: unknown) {
    if (typeof username !== "string" || username.length < 3) {
      return `Usernames must be at least 3 characters long`;
    }
  }
  
  function validatePassword(password: unknown) {
    if (typeof password !== "string" || password.length < 6) {
      return `Passwords must be at least 6 characters long`;
    }
  }
  
  function validateUrl(url: string) {
    let urls = ["/jokes", "/", "https://remix.run"];
    if (urls.includes(url)) {
      return url;
    }
    return "/jokes";
  }


export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const loginType = form.get("loginType");
    const username = form.get("username");
    const password = form.get("password");
    const redirectTo = validateUrl(
      form.get("redirectTo")?.toString() || "/jokes"
    );
    if (
      typeof loginType !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof redirectTo !== "string"
    ) {
      return badRequest({
        fieldErrors: null,
        fields: null,
        formError: `Form not submitted correctly.`,
      });
    }
  
    const fields = { loginType, username, password };
    const fieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      return badRequest({
        fieldErrors,
        fields,
        formError: null,
      });
    }
  
    switch (loginType) {
      case "login": {
        // login to get the user
        // if there's no user, return the fields and a formError
        // if there is a user, create their session and redirect to /jokes
        const user = await login({username, password});
        console.log({ user });
        if (!user) {
            return badRequest({
            fieldErrors: null,
            fields,
            formError: `Username/Password combination is incorrect`,
            });
        }
        return createUserSession(user.id, redirectTo);
      }
      case "register": {
        const userExists = await db.user.findFirst({
          where: { username: username },
        });
        if (userExists) {
          return badRequest({
            fieldErrors: null,
            fields,
            formError: `User with username ${username} already exists`,
          });
        }
        
        const user = await register({username, password});
        if (!user) {
            return badRequest({
            fieldErrors: null,
            fields,
            formError: `Something went wrong trying to create a new user.`,
            });
        }
        return createUserSession(user.id, redirectTo);
      }
      default: {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `Login type invalid`,
        });
      }
    }
  };

  export const meta: MetaFunction = () => ({
    description:
      "Login to submit your own jokes to Remix Jokes!",
    title: "Remix Jokes | Login",
  });


export default function Login() {
    const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className="grid place-items-center h-screen">
      <div className="content-center">
        <div className="bg-white py-8 px-24 content-center rounded">
          <h1 className="text-center text-4xl">Login</h1>
          <form method="post">
            <input
              type="hidden"
              name="redirectTo"
              value={
                searchParams.get("redirectTo") ?? undefined
              }
            />
            <fieldset className="py-3 grid place-items-center">
              <div className="flex flex-row mb-3">
              <label className="mr-4">
                <input
                  type="radio"
                  name="loginType"
                  value="login"
                  defaultChecked={
                      !actionData?.fields?.loginType ||
                      actionData?.fields?.loginType === "login"
                    }
                />{" "}
                Login
              </label>
              <label>
                <input
                  type="radio"
                  name="loginType"
                  value="register"
                  defaultChecked={
                      actionData?.fields?.loginType ===
                      "register"
                    }
                />{" "}
                Register
              </label>
              </div>
            </fieldset>
            <div className="my-3">
              <label htmlFor="username-input">Username</label>
              <br></br>
              <input
                type="text"
                id="username-input"
                name="username"
                className="form-input px-4 py-3 rounded"
                defaultValue={actionData?.fields?.username}
                aria-invalid={Boolean(
                  actionData?.fieldErrors?.username
                )}
                aria-errormessage={
                  actionData?.fieldErrors?.username
                    ? "username-error"
                    : undefined
                }
              />
              {actionData?.fieldErrors?.username ? (
                <p
                  className="form-validation-error"
                  role="alert"
                  id="username-error"
                >
                  {actionData.fieldErrors.username}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="password-input">Password</label>
              <br></br>
              <input
                id="password-input"
                name="password"
                type="password"
                className="form-input px-4 py-3 rounded"
                defaultValue={actionData?.fields?.password}
                aria-invalid={Boolean(
                  actionData?.fieldErrors?.password
                )}
                aria-errormessage={
                  actionData?.fieldErrors?.password
                    ? "password-error"
                    : undefined
                }
              />
              {actionData?.fieldErrors?.password ? (
                <p
                  className="form-validation-error"
                  role="alert"
                  id="password-error"
                >
                  {actionData.fieldErrors.password}
                </p>
              ) : null}
            </div>

            <div id="form-error-message">
              {actionData?.formError ? (
                <p
                  className="form-validation-error"
                  role="alert"
                >
                  {actionData.formError}
                </p>
              ) : null}
            </div>
            <div className="grid place-items-center">
              <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium mt-3">
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="grid place-items-center">
          <div className="flex flex-row mb-3 mt-5">
            <Link to="/" className="text-green-500">Home</Link>
            <Link to="/jokes" className="ml-5 text-green-500">Jokes</Link>
          </div>
        </div>
      </div>
    </div>
  );
}