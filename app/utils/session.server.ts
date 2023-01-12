import bcrypt from "bcryptjs";
import {
    createCookieSessionStorage,
    redirect,json
  } from "@remix-run/node";
import { db } from "./db.server";
import { Params } from "@remix-run/react";
import { convertDate } from "~/utils/helpers";

type LoginForm = {
  username: string;
  password: string;
};

export async function register({
    username,
    password,
  }: LoginForm) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { username, passwordHash },
    });
    return { id: user.id, username };
  }
  

export async function login({
  username,
  password,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) return null;

  return { id: user.id, username };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
      name: "RJ_session",
      // normally you want this to be `secure: true`
      // but that doesn't work on localhost for Safari
      // https://web.dev/when-to-use-local-https/
      secure: process.env.NODE_ENV === "production",
      secrets: [sessionSecret],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

  function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
  }
  
  export async function getUserId(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "number") return null;
    return userId;
  }
  
  export async function requireUserId(
    request: Request,
    redirectTo: string = new URL(request.url).pathname
  ) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "number") {
      const searchParams = new URLSearchParams([
        ["redirectTo", redirectTo],
      ]);
      throw redirect(`/login?${searchParams}`);
    }
    return userId;
  }

  export async function getUser(request: Request) {
    const userId = await getUserId(request);
    if (typeof userId !== "number") {
      return null;
    }
  
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      });
      return user;
    } catch {
      throw logout(request);
    }
  }
  
  export async function logout(request: Request) {
    const session = await getUserSession(request);
    return redirect("/login", {
      headers: {
        "Set-Cookie": await storage.destroySession(session),
      },
    });
  }
  
  export async function createUserSession(
    userId: number,
    redirectTo: string
  ) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.commitSession(session),
      },
    });
  }


  export async function likeJoke (jokeId: Number, request: Request){
    const userId = await requireUserId(request);
    const joke = await db.joke.findUnique({
      where: { id : Number(jokeId)},
    });
    
    if(!joke){
      throw new Response(`Can't like what does not exist`, {status: 404})
    }
  
    const jokelikess = await db.jokelikes.findFirst({
      where: { jokeId : Number(jokeId), userId:  Number(userId)},
    });
    console.log("EDDDDD");
    if(!jokelikess){
      console.log("OOOOOOOEDDDDD");
      try{
        await db.jokelikes.create({
          data: { jokeId: Number(joke.id), userId: Number(userId), is_like: true, is_un_like: false },
        });
      }
      catch(e){
        console.log(e);
      }
    }
    else{
      await db.jokelikes.updateMany({
        where: {
          jokeId: joke.id, userId:  Number(userId)
        },
        data: {
          is_like: !(jokelikess.is_like),
          is_un_like: jokelikess.is_like !== true ? false : jokelikess.is_un_like,
        },
      })
    }
  }
  
  export async function unlikeJoke (jokeId: Number, request: Request){
    const userId = await requireUserId(request);
    const joke = await db.joke.findUnique({
      where: { id : Number(jokeId)},
    });
    
    if(!joke){
      throw new Response(`Can't like what does not exist`, {status: 404})
    }
  
    const jokelikess = await db.jokelikes.findFirst({
      where: { jokeId : Number(jokeId), userId:  Number(userId)},
    });
    if(!jokelikess){
      await db.jokelikes.create({
        data: { jokeId: Number(joke.id), userId: Number(userId), is_like: false, is_un_like: true },
      });
    }
    else{
      await db.jokelikes.updateMany({
        where: {
          jokeId: joke.id, userId:  Number(userId)
        },
        data: {
          is_like: jokelikess.is_un_like !== true ? false : jokelikess.is_like,
          is_un_like: !(jokelikess.is_un_like),
        },
      })
    }
  }
  
  export async function favorite (jokeId: Number, request: Request){
    const userId = await requireUserId(request);
    const joke = await db.joke.findUnique({
      where: { id : Number(jokeId)},
    });
    
    if(!joke){
      throw new Response(`Can't like what does not exist`, {status: 404})
    }
  
    const favorite = await db.favorites.findFirst({
      where: { jokeId : Number(jokeId), userId:  Number(userId)},
    });
    if(!favorite){
      await db.favorites.create({
        data: { jokeId: Number(joke.id), userId: Number(userId) },
      });
    }
    else{
      await db.favorites.deleteMany({
        where: { jokeId : Number(jokeId), userId:  Number(userId)},
      });
    }
  }

  export async function deleteJoke(jokeId: Number, request: Request){
    const userId = await requireUserId(request);
    const joke = await db.joke.findUnique({
      where: { id : Number(jokeId)},
    });
  
    if(!joke){
      throw new Response(`Can't delete what does not exist`, {status: 404})
    }
  
    if(joke.jokesterId !== userId){
      throw new Response(
        "Pssh, nice try. That's not your joke",
        { status: 403 }
      );
    }
  
    await db.joke.delete({
      where: {id: Number(jokeId)}
    });
  }

  export async function getUserName(userId: Number){
    const user = await db.user.findUnique({
      where: { id: Number(userId) }
    });
    return user?.username;
  }

  export async function get_jokes(start: Number, request: Request){
    const jokeListItems = await db.joke.findMany({
      skip: Number(start),
      take: 5,
      orderBy: { createdAt: "desc" }
    });

  const user = await getUser(request);
  
  var list_jokes = []

  for (let i = 0; i < jokeListItems.length; i++) {
    const count_likes = await db.jokelikes.count({
      where: { jokeId : Number(jokeListItems[i].id), is_like:  true},
    });
  
    const count_unlikes = await db.jokelikes.count({
      where: { jokeId : Number(jokeListItems[i].id), is_un_like:  true},
    });

    list_jokes.push({
      'id': jokeListItems[i].id,
      'name': jokeListItems[i].name,
      'author': await getUserName(Number(jokeListItems[i].jokesterId)),
      'date_time': convertDate(jokeListItems[i].createdAt),
      "likes": count_likes,
      "un_likes": count_unlikes,
    })
  }

    const jokes_count = await db.joke.count();

    var is_next = jokes_count <= (Number(start)+5);
    var is_prev = Number(start) > 0;


    return json({
      list_jokes,
        user,
        "total_joke": jokes_count,
        "start": Number(start)+1,
        "current": jokes_count > Number(start)+5 ? Number(start)+5 :  Number(start)+(Number(start)+5)-jokes_count,
        "is_next": is_next,
        "is_previous": is_prev,
        "next": "/jokes?start="+(Number(start)+5).toString(),
        "prev": "/jokes?start="+(Number(start)-5).toString(),
    });
  }