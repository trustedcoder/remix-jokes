import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { useActionData, Link, useCatch } from "@remix-run/react";
import { requireUserId, getUserId } from "~/utils/session.server";


export const loader = async ({ request }: LoaderArgs) => {
    const userId = await getUserId(request);
    if (!userId) {
      throw new Response("Unauthorized", { status: 401 });
    }
    return json({});
  };


function validateJokeContent(content: string) {
    if (content.length < 10) {
      return `That joke is too short`;
    }
}
  
function validateJokeName(name: string) {
    if (name.length < 3) {
      return `That joke's name is too short`;
    }
}
  
export const action = async ({ request }: ActionArgs) => {
    const userId = await requireUserId(request);
    const form = await request.formData();
    const name = form.get("name");
    const content = form.get("content");
    // we do this type check to be extra sure and to make TypeScript happy
    // we'll explore validation next!
    if (
      typeof name !== "string" ||
      typeof content !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `Form not submitted correctly.`,
          });
    }

    const fieldErrors = {
        name: validateJokeName(name),
        content: validateJokeContent(content),
      };
  
    const fields = { name, content };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
          fieldErrors,
          fields,
          formError: null,
        });
      }
  
    const joke = await db.joke.create({ data: { ...fields, jokesterId: Number(userId) } });
    return redirect(`/jokes/${joke.id}`);
  };


export default function NewJokesRoute(){
    const actionData = useActionData<typeof action>();
    return (
        <div className="grid place-items-center mt-4">
          <div className="w-full p-28">

          
            <p className="text-lg font-bold text-gray-700 text-center">Add your own hilarious joke</p>
            <form method="post" className="mt-4">
                <div >
                <label>
                    Name: 
                    <br></br><input type="text" 
                    defaultValue={actionData?.fields?.name}
                    name="name"
                    className="form-input px-4 py-3 w-full rounded"
                    aria-invalid={
                        Boolean(actionData?.fieldErrors?.name) ||
                        undefined
                      }
                      aria-errormessage={
                        actionData?.fieldErrors?.name
                          ? "name-error"
                          : undefined
                      } />
                </label>
                {actionData?.fieldErrors?.name ? (
                    <p
                    className="form-validation-error"
                    role="alert"
                    id="name-error"
                    >
                    {actionData.fieldErrors.name}
                    </p>
                ) : null}
                </div>
                <div className="mt-4">
                <label>
                    Content: <br></br><textarea 
                    defaultValue={actionData?.fields?.content}
                    name="content"
                    rows={5}
                    className="form-textarea px-4 py-3 w-full rounded"
                    aria-invalid={
                        Boolean(actionData?.fieldErrors?.content) ||
                        undefined
                      }
                    aria-errormessage={
                    actionData?.fieldErrors?.content
                        ? "content-error"
                        : undefined
                    }
                    />
                </label>
                {actionData?.fieldErrors?.content ? (
                    <p
                    className="form-validation-error"
                    role="alert"
                    id="content-error"
                    >
                    {actionData.fieldErrors.content}
                    </p>
                ) : null}
                </div>
                <div>
                {actionData?.formError ? (
                <p
                className="form-validation-error"
                role="alert"
                >
                {actionData.formError}
                </p>
            ) : null}
            <div className="grid place-items-center">
                <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium mt-3 w-full">
                    Add
                </button>
              </div>
                </div>
            </form>
            </div>
        </div>
    )
}

export function CatchBoundary() {
    const caught = useCatch();
  
    if (caught.status === 401) {
      return (
        <div className="error-container">
          <p>You must be logged in to create a joke.</p>
          <Link to="/login">Login</Link>
        </div>
      );
    }
  }
  
  export function ErrorBoundary() {
    return (
      <div className="error-container">
        Something unexpected went wrong. Sorry about that.
      </div>
    );
  }