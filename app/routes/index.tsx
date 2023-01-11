import type {
    MetaFunction,
  } from "@remix-run/node";
  import { Link } from "@remix-run/react";
  
  
  export const meta: MetaFunction = () => ({
    title: "Remix: So great, it's funny!",
    description:
      "Remix jokes app. Learn Remix and laugh at the same time!",
  });
  
  export default function IndexRoute() {
    return (
      <div className="grid place-items-center h-screen">
        <div className="content">
          <h1 className="grid place-items-center animate-bounce h-35 text-9xl">🤪</h1>
          <h1 className="grid place-items-center">
            <span className="text-6xl text-white">Remix</span>
            <span className="text-9xl text-white">Jokes!</span>
          </h1>
          <nav>
            <ul>
              <li>
                <Link to="jokes" className="grid place-items-center text-green-500 text-xl">Read Jokes</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    );
  }