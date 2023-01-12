import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { json , redirect, MetaFunction} from "@remix-run/node";
import { Link, useLoaderData, useCatch, useParams, Params } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUserName, getUserId, likeJoke, unlikeJoke, favorite, deleteJoke } from "~/utils/session.server";
import { convertDate } from "~/utils/helpers";


export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: Number(params.jokeId) },
  });
  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }
  const jokelikess = await db.jokelikes.findFirst({
    where: { jokeId : Number(params.jokeId), userId:  Number(userId)},
  });
  if(!jokelikess){
    var is_like = false;
    var is_un_like = false;
  }
  else{
    var is_like = jokelikess.is_like;
    var is_un_like = jokelikess.is_un_like;
  }

  const favorite = await db.favorites.findFirst({
    where: { jokeId : Number(params.jokeId), userId:  Number(userId)},
  });
  if(favorite){
    var is_favorite = true;
  }
  else{
    var is_favorite = false;
  }

  // total likes and unlike
  const count_likes = await db.jokelikes.count({
    where: { jokeId : Number(joke.id), is_like:  true},
  });

  const count_unlikes = await db.jokelikes.count({
    where: { jokeId : Number(joke.id), is_un_like:  true},
  });

  return json({ 
    joke, 
    isOwner: Number(joke.jokesterId) === Number(userId), 
    is_like: is_like, 
    is_un_like: is_un_like, 
    is_favorite:  is_favorite,
    count_likes: count_likes,
    author: await getUserName(Number(joke.jokesterId)),
    date_created: convertDate(joke.createdAt),
    count_unlikes: count_unlikes });
};

export const action = async ({ params, request }: ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");
  const jokeId = form.get("jokeId");
  const userId = await getUserId(request);
  console.log(userId)
  if(userId){
    if(intent === "delete"){
      await deleteJoke( Number(jokeId), request );
      return redirect("/jokes");
    }
    else if(intent === "like"){
      await likeJoke( Number(jokeId), request );
      return redirect("/jokes/"+jokeId);
    }
    else if(intent === "unlike"){
      await unlikeJoke( Number(jokeId), request );
      return redirect("/jokes/"+jokeId);
    }
    else if(intent === "favorite"){
      await favorite( Number(jokeId), request );
      return redirect("/jokes/"+jokeId);
    }
  }
  else{
    return redirect("/login");
  }


};



export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found",
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};


export default function JokeRoute(){
  const data = useLoaderData<typeof loader>();
    return (
        <div>
          <p className="border-solid border border-green-600 px-3 py-3 text-base bg-gray-800 text-white"><Link className="text-lg text-green-500" to=".">{data.joke.name}</Link> By {data.author} on {data.date_created}</p>
          <p className="px-3 py-3">{data.joke.content}</p>

          <div className="flex flex-row mt-4 px-3 py-3">
            <div className="mr-1 text-black">
              <span>{data.count_likes}</span></div>
            <div className="mr-4">
              <form method="post">
              <input value={data.joke.id} name="jokeId" hidden/>
                <button name="intent" value="like" type="submit">
                  { data.is_like ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-red-500"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>
                  ) : (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-white"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>)
                  }
                </button>
              </form>
            </div>
            <div className="mr-1 text-black">
              <span>{data.count_unlikes}</span>
            </div>
            <div>
            <form method="post">
            <input value={data.joke.id} name="jokeId" hidden/>
              <button name="intent" value="unlike" type="submit">
              { data.is_un_like ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-red-500"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" /></svg>
                ): (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-white"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" /></svg>)
              }
              </button>
            </form>
            </div>
              <div className="ml-3">
              <form method="post">
              <input value={data.joke.id} name="jokeId" hidden/>
                <button name="intent" value="favorite" type="submit">
                { data.is_favorite ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-red-500"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                  ): ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-white"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>)
                }
                  </button>
              </form>
            </div>
            <div className="ml-4">
                {data.isOwner ? (
              <form method="post">
                <input value={data.joke.id} name="jokeId" hidden/>
                <button name="intent" value="delete" type="submit" className="shadow-inner p-1 bg-red-700 rounded-md text-white text-sm font-mono">Delete</button>
              </form>
              ) : null}
            </div>
          </div>
          </div>
      );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400: {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.jokeId}?
        </div>
      );
    }
    case 403: {
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not your joke.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}