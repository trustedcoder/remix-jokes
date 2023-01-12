import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import { getUserId, likeJoke, unlikeJoke, favorite, deleteJoke, get_jokes,get_top_jokes } from "~/utils/session.server";
import { convertDate } from "~/utils/helpers";

import type {
  ActionArgs,
    LoaderArgs,
  } from "@remix-run/node";

export const loader = async ({request }: LoaderArgs) => {
  const url = new URL(request.url);
  var start = url.searchParams.get("start");
  try{
    var start_num = Number(start);
    console.log(start_num);
  }
  catch(e){
    var start_num = 0;
  }
  if(isNaN(start_num)){
    var start_num = 0;
  }
  var dta = {
    topJokeList: await get_top_jokes(request),
    jokeList: await get_jokes(start_num, request),
  }
  return await json(dta);
};

    export const action = async ({ params, request }: ActionArgs) => {
      const form = await request.formData();
      const intent = form.get("intent");
      const jokeId = form.get("jokeId");
      const userId = await getUserId(request);
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
  
      return null;
    
    };

    export default function JokesRoute() {
        const data = useLoaderData<typeof loader>();
      
        return (
          <div className="jokes-layout">
            <header className="sticky top-0 z-30 w-full px-2 py-4 bg-gray-800 sm:px-4 shadow-xl">
              <div className="flex items-center justify-between mx-auto max-w-7xl">
              <Link
                    to="/"
                    title="Remix Jokes"
                    aria-label="Remix Jokes"
                  >
                  <span className="text-4xl font-extrabold text-[#980bee] hover:text-blue-600">J🤪KES</span>
                </Link>
                <div className="flex items-center space-x-1">
                  

                  {data.jokeList.user ? (
                    <ul className="hidden space-x-2 md:inline-flex">
                      <li className="self-center">
                        <span className="place-items-center px-4 py-2 font-semibold text-gray-300 rounded">{`Hi ${data.jokeList.user.username}`}</span>
                      </li>
                      <li className="self-center">
                        <span className="place-items-center px-4 py-2 font-semibold text-gray-300 rounded">Favorites</span>
                      </li>
                      <li>
                          <form action="/logout" method="post"><button type="submit" className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button></form>
                      </li>
                    </ul>) : (
                  <ul className="hidden space-x-2 md:inline-flex">
                    <li><Link to="/login" className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium">Login</Link></li>
                  </ul>
                )}

                  <div className="inline-flex md:hidden">
                    <button className="flex-none px-2 ">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                      </svg>
                      <span className="sr-only">Open Menu</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <section className="p-4 mx-auto max-w-7xl px-2">
              <div className="mx-auto font-sans">
              <div className="flex flex-row mb-3 content-cente">
                <span className="text-2xl font-bold my-3"><Link to="." className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium">Get a random joke</Link></span>
                <span className="text-2xl font-bold my-3 ml-4"><Link to="new" className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium">Add your own</Link></span>
              </div>
              
                <div className="grid grid-cols-4 gap-4">
                  <div className="">
                  <h5 className="text-lg text-violet-100 font-bold mb-5">New jokes</h5>
                  {data.jokeList.list_jokes.map((joke) => (
                    <div className="border-x border-y mb-2 px-2 rounded bg-black">
                      <p className="text-lg text-green-500"><Link to={joke.id.toString()}>{joke.name}</Link></p>
                      <p className="text-sm text-white">By {joke.author} on {joke.date_time}</p>
                      <div className="flex flex-row mt-4 mb-2">
                        <div className="mr-1 text-white"><span>{joke.likes}</span></div>
                        <div className="mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>
                        </div>
                        <div className="mr-1 text-white">
                          <span>{joke.un_likes}</span>
                        </div>
                        <div>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" /></svg>
                        </div>
                      </div>
                    </div>
                    ))}
                    <div className="flex flex-row mt-4 px-3 py-3 bg-black">
                      <span className="text-xs text-cyan-50">Showing {data.jokeList.start} to {data.jokeList.current} of {data.jokeList.total_joke} results</span>
                      <div className="flex flex-row mb-3">
                      { data.jokeList.is_previous ? (
                        <Link to={data.jokeList.prev} className="bg-green-600 text-white px-3 py-2 rounded-md text-xs font-medium">Previous</Link>
                        ): ( <span className="bg-gray-900 text-white px-3 py-2 rounded-md text-xs font-medium">Previous</span> )
                      }
                      { data.jokeList.is_next ? (
                        <span className="bg-gray-900 text-white px-3 py-2 rounded-md text-xs font-medium ml-2">Next</span>
                        ): ( <Link to={data.jokeList.next} className="bg-green-600 text-white px-3 py-2 rounded-md text-xs font-medium ml-2">Next</Link>)
                      }
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 bg-blue-200 max-h-screen border-solid border-2 border-green-600">
                    <div className="">
                      <Outlet />
                    </div>
                  </div>
                  <div className="">
                  <h3 className="text-lg text-violet-100 font-bold mb-5"> Top rated jokes:</h3>
                  {data.topJokeList.list_top_jokes.map((joke) => (
                    <div className="border-x border-y mb-2 px-2 rounded bg-black">
                      <p className="text-lg text-green-500"><Link to={joke.id!.toString()}>{joke.name}</Link></p>
                      <p className="text-sm text-white">By {joke.author}</p>
                      <div className="flex flex-row mt-4 mb-2">
                        <div className="mr-1 text-white"><span>{joke.likes}</span></div>
                        <div className="mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-white"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>
                        </div>
                        <div className="mr-1 text-white">
                          <span>{joke.un_likes}</span>
                        </div>
                        <div>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 fill-white"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" /></svg>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      }