import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const loader = async () => {
    return json({
      jokeListItems: await db.joke.findMany(),
    });
  };

export default function JokesRoute(){
    const data = useLoaderData<typeof loader>();
    return (
        <div>
            <h1>J🤪KES</h1>
            <ul>
              {data.jokeListItems.map((joke) => (
                <li key={joke.id}>
                  <Link to={(joke.id).toString()}>{joke.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new">Add your own</Link>
            <main>
                <Outlet/>
            </main>
        </div>
    );
}