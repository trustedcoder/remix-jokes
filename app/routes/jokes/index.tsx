import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const loader = async () => {
    const count = await db.joke.count();
    const randomRowNumber = Math.floor(Math.random() * count);
    const [joke] = await db.joke.findMany({
        take: 1,
        skip: randomRowNumber,
      });
    if (!joke) {
      throw new Error("Joke not found");
    }
    return json({ joke });
  };


export default function JokesIndex(){
    const data = useLoaderData<typeof loader>();
    return (
        <div>
            <p>Here's a random joke:</p>
            <p>
                {data.joke.content}
            </p>
            <Link to={(data.joke.id).toString()}>
                "{data.joke.name}" Permalink
            </Link>
        </div>
    )
}