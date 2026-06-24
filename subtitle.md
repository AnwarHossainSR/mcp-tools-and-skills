Remember when it felt like a new JavaScript framework was dropping every week? That's how it feels to work with AI right now. Every few months, there's a new shiny thing that everyone is

talking about. At first, MCPs were the future, something that you had to learn. And before most people even caught up with them, everyone moved on to creating skills. The problem is that most

developers are learning these technologies using the wrong approach. Imagine you're building a new AI tool. One user wants a CLI. Another wants cloud code integration. Someone else

wants it to work inside chat GPT on the web. And now people expect you to create a skill for your tool as well. Suddenly you are not building for one environment anymore. You are building for all of

them. And that's where things start to get complicated. The question is no longer should I learn MCPS or should I learn skills. The question becomes how do I build a tool and make it work

everywhere? That's the question I've spent the last few months trying to answer. I've been building, deploying, and experimenting with all of these approaches. And in this tutorial, I'm

going to bring them together into what is probably the most complete guide to AI tooling I've seen so far. Not just how to build an MCP server, not just how to create a skill, but how all of these

technologies fit together inside a realworld architecture. We'll start by building a traditional CLI tool that a human can invoke directly from the terminal. Then we'll expose that same

capability through a local MCP server allowing coding agents like cloud code, open code and codeex to invoke it through tool calls using the standard input output protocol. After that we'll

build a remote MCP server and deploy it to the web making the exact same operation available to web-based AI assistants like chatgpt.com over HTTP. And finally, we'll create a

skill that teaches an agent how to use our tooling automatically, allowing it to invoke our CLI, just like a human would. The interesting part isn't the tool we are going to execute. The

interesting part is that every one of these adapters will be powered by the exact same shared core. One implementation, one source of truth, multiple adapters. Along the way, you'll

learn how to structure a productionready monorreo, publish reusable npm packages, distribute skills, deploy MCP servers, and most importantly, build a mental model for how all of these technologies

fit together. By the end of this video, you will understand the difference between skills, local MCPs, remote MCPs, and CLIs. When each one should be used and how they fit together into a single

architecture for building AI tools in 2026. Let's get started. This project is going to be a monor repository with four different adapters which all connect to the same shared core which finally

communicates with the telegram bot API which essentially allows us to send telegram messages through the CLI where a human can invoke it through a local MCP server so clot codeex open code can

invoke it or through a remote MCP server which allows any HTTP client to invoke it like chatgpt.com or claude.com basically any web application. And the last one that we

have is a skill. A skill is a specific hybrid between all of these things I've just explained. and they are basically agent instructions which will allow the agent to decide whether it wants to use

the CLI, the local MCP server or the remote MCP server. Let's take a deeper look at the workflow and how it all comes together. The first workflow I want to demonstrate is the CLI adapter.

This one is pretty simple. A human runs a CLI with a command like send telegram uses a shared core to validate the parameters sent in this command and finally invokes the send message

operation which triggers the external telegram bot API and it looks something like this. message kit, telegram, the chat ID where we want to send the message, and finally the actual message.

And you can see how that looks like here. I have a message hello from the CLI. So now that we know what a CLI tool is to a human, we get a better understanding of what an MCP server is

to an agent. I've just demonstrated what a human would do to use a CLI tool to send a message to Telegram. So we would type messagekit, send kit, whatever is the name of the CLI tool, and then we

would add some arguments, the chat ID and the message. So how exactly do we make an agent do the same? The answer is an MCP server. MCP server is a standardized way for an agent to perform

specific operations in form of tool calls. So how do you set up a local MCP server? A local MCP server looks something like this. What I'm showing you right now is the configuration for

open code. But for example, you can see that configuration for cloud code looks very similar. And the same is true for codecs or whatever else you might be using. But the actual MCP is this. So

this is what we're going to be developing, not the actual config. The config doesn't mean anything to us. What we have to do is we have to develop an agent compatible CLI tool. Now let's

demonstrate how it works. Once you set up a configuration like this in your project, you will be able to check it out using the MCPS. You can see that I have message kit connected in open code.

And I also have it connected here in my cloud code. And once you have the configuration set up, you can use natural language to tell your coding agent to invoke an MCP. And you can pass

along the arguments using natural language as well. So use messagekit MCP to send a telegram message. Use this chat ID and send this message. Let's go ahead and press enter. In a few seconds

you will see it uses the message kit telegram tool with the chat ID and message argument. And in here there we go. Hello from open code. Now let's go ahead and test out cloud code. So once

again I have the configuration ready and I'm telling it to do the exact same thing. So it's going to go ahead. It's going to find the MCP. I need to give it permissions. So I'm going to say yes.

And here we have another message hello from cloud code. The last adapter which we are going to demonstrate and which we are going to build is the remote MCP server. So, why would we need this when

we already have a perfectly fine local MCP server? We've clearly demonstrated that agents are able to use it. Well, the problem isn't with whether agents can use it or not. The problem is that

remote MCP servers and local MCP servers are made for completely different environments. A local MCP server is great if you are going to have a coding agent running on your machine. But what

if you wanted to invoke this MCP server on chatgpt.com or claude.com? That becomes a problem because none of these websites have this package installed or this configuration set up.

That's why we are going to need to develop a remote MCB server and we're going to need to host it somewhere. Once we deploy it and it is available online, we are going to add a custom

application. You can see how I've added message kit here in my custom apps in chat GPT. And you can see how the URL is basically a deployment on railway which is what we are going to learn how to do.

You can see how in here I've embedded the environment key for telegram and I've added the MCP suffix here as the route and I've done the same thing here in claude connectors and here is my

custom message kit and you can see it recognizes the telegram tool. So let's go ahead and test chat GPT first. use message kit MCP to send a telegram message. Let's see what it's going to

do. So, it's looking for available tools and you can see I have to confirm that I wanted to send this message. And there we go. Message sent successfully. Let's take a look. Hello from chatgpt.com.

And now let's test the same thing for Claude. So, I'm going to send use messagekit MCP to send a Telegram message. And you can see once again it successfully loaded the tool. And let's

check it out. Hello fromclude.com. So, we've successfully proven that even in a on a website, we can still communicate with our MCP tool thanks to the remote MCP server. And that is why

you need all three adapters. Now we still have one question left. Why do we exactly need the CLI tool? So far only a human can use it. Well, this is where it gets interesting thanks to something

called skills. So skills are relatively new in comparison to MCP servers. The way skills work is they are basically a set of agent instructions which explain to the agent how a CLI tool might be

used. The reason why this is sometimes beneficial uh in comparison to an MCP server is token usage. Sometimes a combination of skill and the CLI ends up being cheaper for token usage than local

MCP or remote MCP servers. So how can a skill replace an MCP? Well, the first step is to make your skill distributable. The way you do this is just by deploying it on GitHub. That's

all you have to do. you need to add your skill.md to a public GitHub repository. I'm going to teach you how to do that in this tutorial as well as how to develop the

actual skill file. And once you publish it on your GitHub repository, you will be able to use npx skills add and then simply link your GitHub repository to your skill location. Go ahead and press

enter, install it, and your users will be able to install it in this exact way, and then open open code. And what I've done is I've purposely disabled the message kit MCP so you don't think that

I'm cheating, right? And of course, the same thing works in cloud code and codeex. I'm just using open code because it's the first one that came to mind. So, how would I do a Telegram operation

now? Well, I would go inside of my skills and I would find message kit skill and I would tell it chat ID and then I would tell it message from open code using skill not MCP.

You can see that it loaded that skill. it is now injecting it and now it's using messagekit cli just like a human would use it and it even added a d-json so it can read the output and tell us

whether it was successful or not and in here we can see message from open code using skill not mcp so we have successfully sent a telegram operation using a skill and not a local

or remote MCP server. In this tutorial, you're going to learn how to build this entire architecture that we just went through. You're going to learn how to build a CLI tool, a local MCP server, a

remote MCP server, and finally a skill that is going to teach the agent how to use the CLI tool or the MCP server depending on what it has available and what is cheaper for token usage. We're

going to learn how to do this in a productionready monorreository with a shared core so that we only have to develop the actual send message API once and then easily plug and play into any

adapter we create. This is in my opinion the most complete tutorial on building MCP tools and skills in 2026. So let's get started. In this lesson, we're going to build the command line interface.

This is the first flow we've demonstrated which is triggered by a human and only later it will also be used by an agent once we learn how to implement a skill that teaches the agent

to do so. The CLI is the perfect tool to build first because it holds the foundation of this project. And by having a human run it instead of an agent, it will be that much easier for

us to test whether it works correctly and to demonstrate it in general. It's also going to serve as the perfect foundation to build the shared core, which we are only going to have to

develop once and then simply adapt to a local MCP server and a remote MCP server later on. Let's go over all the tools that you need to successfully develop this project. The first and foremost,

you're going to need a node installed on your machine. I would always recommend having the most up-to-date version, which in this case is 24.16, but I would just recommend not being

below 20, as at this point that is pretty deprecated and might cause problems with some modern dev tooling. To check whether you have successfully installed Node on your machine, you can

go inside of your terminal and simply run node-v. And that's going to print out your version. So I'm using 22.20 and that is perfectly fine for me to develop this project. If you have a version below

this, I would suggest bumping it up. Once you install node, you're also going to get access to npm and npx. Don't worry about these versions too much as they are different depending on the

operating system that you're using. So I am on Mac OS so I have these versions but if you are on Linux or Windows you might have some different versions. that's perfectly fine. Just make sure

that your node version is higher than 20 or as close to mine as possible. If you have a higher version than mine, that's also perfectly fine. For npm and npx, just make sure that they are actually

runnable and not causing any errors when you try to run them. Now, the second thing we're going to need is bun. You might be thinking, how come we need both node and bun? Well, we are going to use

node as the final runtime of our tools. Meaning the end users to whom we are going to distribute our CLI tools. Meaning these ones, the CLI, the MCP server, all of that will be run on

NodeJS because general population most often has NodeJS especially developers. But to make development easier for us, we are going to use bun as the package manager and we are going to use it as

the uh monor repository workspaces management because npm as far as I know doesn't come with that out of the box. Besides workspaces, monorreo and package management, bun also comes with a bunch

of handy little tools and utils that replace a bunch of other tools we would otherwise have to install separately and learn. So just to make your mind at ease, yes, we are going to be using bun

to develop this, but your end user is not going to need to have bun installed on their machine. So only the developers, you and me are going to use bun to develop this project. So you

should have bun available. This is the version I am using. Now I'm not entirely sure if these versions are different depending on the operating system, but as long as you actually have bun and you

can run this command without any error, you are perfectly fine. Next, we have git. This is pretty self-explanatory. We're going to be using Git for version control. Alongside all of these tools, I

would also recommend uh creating an npm account and creating an organization. You don't have to do this right now, but this will be important if you actually want to distribute this project. So, if

you just want to build it and test it out locally, you can completely skip this step. But later in the project when we actually learn how to create an npm package anyone can install. You're going

to need to be able to install an uh to create an npm account. I am on a completely free tier. So all of this should be possible for you to do. You don't have to do it now. I'm just

telling you in advance. And same is true for your GitHub account. You should be you should have a GitHub account where you can publish the final project which is going to look something like this

where we are going to host our uh skill.md which will later be used by npx skills commands which I've shown you uh in the previous demonstration. So if you have these commands you are ready to get

started. Now it's time to create a new project. I'm going to start by creating a new folder and I'm going to give it a name of scentkit which is also going to be the name of this project and the name

of the commands that we are going to run. Because of that reason, I would recommend using the exact same project name as me so it's easier to follow along. Once we create that new folder,

let's go inside of it and let's go ahead and initialize an empty git repository inside. In case you are wondering why am I calling this project send kit when all of the previous demonstration was done

under the name message kit. Well, for a very simple reason. If I type sendkit just like you, I get an error. But you can see that since I've already developed message kit, I have some

leftover commands which might confuse you or it might cause a problem with me forgetting to implement something and thinking that it works because I can do it and it turns out I already have the

package installed. So because of that, I'm starting with a completely new name, send kit, instead of message kit, so we can truly build everything from scratch once again. So once you have initialized

an empty git repository inside, go ahead and open it in your favorite IDE. For this example, I'm going to be using VS Code. Before we install anything, let's go ahead and add a.get git ignore file

which is going to ensure that we don't accidentally commit node modules dist our environment files or anything similar. The only exception we are going to make is for the exact environment.ample

file which we can immediately create. So environment.example will be committed because it is explicitly omitted from git ignore. And inside of environment.example example.

Let's go ahead and simply prepare Telegrambot token with this exact name. Now, let's go ahead and create a new package.json file. And inside, let's go ahead and open an object with the name sendkit

workspace private set to true and type set to module. And then let's go ahead and add a tsconfig.json with the following compiler options. a target module module resolution strict

types and skip lib check set to true. So this exact configuration isn't terribly important, but if you make yours the same as mine, you reduce the chances of having some type problems or compile

problems later when we actually start bundling our command line tools. So because of that, I would recommend using the exact same TS config as me. Now it's time to set up a monor repo within this

project. And thankfully we are using bun which makes it extremely simple to do so. So you can find the documentation on workspaces by going inside of bun and select the option of package manager.

And then down here you can find workspaces and how everything works inside. So the first thing we have to do is we have to define where are we going to keep our workspaces. So let's go

ahead and add that right here. So after type module, let's add a comma and let's go ahead and define workspaces to be under the packages right here and everything that's inside. So I'm going

to go ahead and create a new folder called packages. Now inside of packages, let's go ahead and create our CLI tool. And inside, let's go ahead and add another package.json.

Let's go ahead and give it a name of sendkit. Let's give it a version of 0.0.0. And for now, let's go ahead and keep it private. Now that we have the CLI package and we have the root package

JSON, let's go ahead and run bun install in the root of our app. And you can see that that's going to say one package installed. And if you take a look at bun.lo,

it is going to initialize packages CLI. So now we can go ahead and properly use this CLI package as a part of this monor repository. So make sure that you run bun install from the root of your

project after you have added the package JSON here. Now let's go ahead and install some dependencies in our CLI package. So I'm going to change directory to packages CLI and I'm going

to do bun add commander. Next, let's go ahead and do bun add- at types forward slash node. So, let's take a look at our package. JSON in the CLI folder. Now, in the dependencies, I

now have commander and in the dev dependencies, I now have types node. Now, let's go ahead and create a very simple example of a command line interface that we can actually run. So

inside of the CLI folder, create a new folder called source. And inside index.ts file. In here, we're going to import command from commander. We're going to initialize a new program using new

command instance. And then to that program, we are going to attach a name, a description, a command called telegram with a description send a telegram message. Two arguments. First one being

chat ID and the second one being message and then finally an asynchronous action which gives us access to whatever user wrote for the argument of chat ID and the message. We're going to console log

the chat ID, console log the message and then do a process exit. And last let's go ahead and add program parse asynchronous processargument v. Go ahead and save that file. Now that

we have this very basic command line interface, let's go ahead back inside of the root package. JSON and after workspaces, let's go ahead and add scripts. And let's register one script

dev cli. And let's make it do bun run packages cli source index.ts and ensure that that path actually exists. So, packages CLI source index.ts. So, this is one of the reasons bun is a

very useful development toolkit as usually it isn't this easy to run a TypeScript file without any additional tooling. So, it's small things like that in in combination with the workspace and

the monor repo and everything else that makes bun really fun to develop with. But again I repeat the end result is going to be node compatible. So your users will not need to have bun. Only

the maintainer the developer needs bun to actually run this. So let's go in the root of our project. So make sure you are in the root and simply run bun install just to make sure that

everything is synchronized. Even though we added some packages directly in the CLI package JSON, it's always a good idea to run bun install from the root just to refresh the lock file. And then

let's do bunr rundev cli. You should get an error, but also you should get usage sendkit options command sendkit tutorial CLI. And here are the options. Help and here are the commands. Telegram with

chat ID and message. So now let's go ahead and actually do it. So CLI Telegram some random chat ID and some random message and you can see the response. I can see the chat ID and I

can see the message. So we have successfully confirmed that our CLI tool is actually working. We can accept a chat ID and the message argument and we successfully print it out and then we

exit the process. Beautiful. So now that we know how to parse the arguments from a command line interface, it's time to actually process it with a Telegram bot API. Now we have to obtain the Telegram

bot API key. You can do this by creating a Telegram account. And for simplicity sake, I would recommend downloading the Telegram desktop client if you have access to it simply so you can do it all

from one machine. Once you log in in the Telegram desktop client, you're going to go inside of search here and you're going to select apps and in here search for bot father. So this is the official

Telegram uh bot creator. Okay. So I'm going to go ahead and click create a new bot and I'm going to call this send kit. I'm going to leave the about to be empty and for the actual name I'm going to

call it so I'm going to use a prefix CVA as in code with Antonio sendkit_bot. So it's important that it ends in underscorebot and then let's go ahead and hit create

bot. In here you now have the send kit bot and you can see the environment key. So this is what I'm going to do now. I'm going to put this on the side and I'm going to copy environment example.

I'm going to paste it and I'm going to rename it to just be environment and then I'm going to copy this token here and I'm going to paste it here. There we go. Now let's go back into our CLI

index.ts DS and let's modify it so it actually communicates with the telegram bot which we've just created. So the first thing we have to do is we have to define a telegram response type. This is

later going to be maintained in the core shared package. But since we don't have that just yet, we're going to develop it here in the CLI and later we are also going to use ZOD to actually parse the

response and not just blindly follow this type which we defined. So the telegram response that we expect will have an okay property which is a boolean an optional result which is an object

with message underscore id which is a number and also optional and an optional description. So now what we have to do is we have to go back inside of our asynchronous action here and first thing

first let's check whether we can actually read the process environment telegram bot token. So this thing that we just populated. So if the token cannot be found, this CLI actually

cannot work. Now let's go ahead and also throw an error. If the user didn't provide the telegram chat ID and if user didn't provide a telegram message text and now we have to create the actual

fetch to the telegram API. So luckily for us, this is very simple. We simply have to await fetch https api telegram.orgward slashbot and then inject the token forward slash send message. Then add a

comma and open the headers in here. Sorry, open the config. The method is going to be a post method. The headers will have content type set to application JSON and the body is going

to be stringified object chat underscore id which is mapped to our chat id and the text mapped to our message argument. So it's very important that you properly spell this chat ID. So we we in here

telegram accepts chat ID but since we are working in JavaScript environment we use camel case right. So you can see how I define the argument to be chat and then capital I so chat ID in camel case.

So if you try to extract it like this uh it wouldn't be a good idea even though I think it will work simply because we the way we extract arguments is by order of their definition right so it doesn't

really matter what you name them here I think I think it's completely uh order based right so the first argument in here is the first argument you define and the second argument here is the

second argument you define but still it's a good idea to make sure all of these are named exactly the same So you don't have any problems. Great. And now we have the response. And once we have

the response, we can extract the data from it by doing await response.json which we wrap in parenthesis. So we can cast it as telegram response type which we defined above. So as I said, this

isn't the cleanest solution because we are purposely casting something without actually parsing whether the result is correct or not. But don't worry, we are going to do that uh in the next lesson

when when we implement the actual core and add zod and schemas and everything. For now, this is perfectly fine. Now let's go ahead and check if the response is not okay. So if response is not okay

or if data is not okay, let's attempt to extract the detail using data.escription or fall back to response.status status text and then we simply console error telegram API request failed with an

attempt to get some detail about why it failed. So this is useful to have both for humans but also for agents so they can uh tell the user what is missing, what went wrong, why did this request fail

and then what we can do we can extract message ID from data.res result question mark message underscore id. Let's go ahead and do a successful console log send telegram message to chat chat ID.

And last but not least, let's do if message ID is not undefined. We can also do console log which telegram message ID was created. So now that we have this functionality implemented, let's go

ahead and make sure the file is saved. And how about we try running the command once again. So here I am running bun rundev cli telegram with some random chat ID. So this is a random number and

a random message. Make sure you're doing this from the root of your project. What's going to happen right now? So you can see it's trying to do something and then it fails. Telegram API request has

failed. Chat not found. So this is an expected error because this number right here is completely unknown to us. So how do we actually find the chat ID? Well, you do that by going inside of your

browser and specifically going at this end point. So aplelegram.org or bot and then bot token slashget updates. So if you take a look it is actually the same as this one. So it is

this exact URL but inside instead of send message it is get updates. So go ahead and grab your bot token here and simply replace this part with the bot ID and then you're going to get the

full URL. Then go ahead and enter that inside of your browser. So get updates. And once you press enter in here, you can see that you get a response. Now my results are completely empty, which is

expected because I didn't start a chat with this bot anywhere. So now let's go ahead and do that and then let's refresh this and see if we get any results. So how do you start a chat with your bot?

Well, the easiest thing you can do is go once again in your Telegram desktop client, go inside of search and this time search within your chats right here and go ahead and type CWA Sendkit_bot

and you will be able to find the bot which you have created. So, of course, this is different depending on the name that you have given your bot because all of them are unique. So, go ahead and

select it. And then down here, you're going to see a big start button. So, let's go ahead and let's hit start. You can see that that sends a message to that bot conversation. Then once again,

refresh this page. And now you will get a completely different result. So, scroll down until you find the chat property. And here is the chat ID. Now, let's go ahead and try sending a message

with that chat ID instead. So, I'm going to remove this dummy ID here. And I'm going to paste this new one. And I'm going to call it hello from dev CLI. So, we know that this is a development

message. And look at that. No error message. And let's take a look down here. Send kit. Hello from dev CLI. So just like that we have successfully made it so we can send telegram messages

using our local CLI tool. So obviously what's not possible yet is to run this anywhere on our machine. Uh what I mean by that is we have to specifically run it using a local script in this project.

So the distribution part is going to come later. For now, I just want to focus on us building the operation and the logic and the codebase. And then later, we're going to focus on

distribution and how to publish it. But for now, this is what we wanted to achieve. A bun rundev CLI which accepts Telegram as a command which accepts two arguments chat ID and a message. And

thanks to the telegram bot token which we have stored in the environment key uh it can read it and it can access our uh telegram API. So yes one more message remains. How are your users supposed to

store telegram bot token? Don't worry we are going to have a solution for that as well. At this point I would recommend staging all of these changes. You can either do that using VS code or you can

do it using the command line. So either get add and then a dot or you could have pressed the plus button here which is now a minus button. And then let's just go ahead and commit this. So get commit.

And I'm just going to call this feature add CLI. As simple as that. Or you could have entered the message here. That's it. You don't have to publish anything for now. I just want to make sure that

you don't have those uncommitted changes and so that you can safely start the next feature without worrying of accidental loss of everything you have developed so far. In this lesson, we're

going to extract the functionality we just developed within our CLI adapter and we are going to make it reusable so that we don't have to repeat this logic for every subsequent adapter we plan on

building. Let me show you how that looks in our diagram. So what's going on right now in our codebase? We've successfully developed the minimal version of the CLI adapter which is consumed by a human.

But right now the CLI directly communicates with the telegram using the operation and the definitions we put inside of the CLI package. So if we wanted to start building the local MCP

server, we would have to repeat building the entire Telegram bot API functionality, error handling, uh types, interfaces, everything once again. And then we would have to do it one more

time for the remote MCP server. So instead of doing that three times, what we are going to do is we're going to go back inside of our CLI tool and we're going to create a brand new package

called shared or send kit core in which we are going to define the telegram message operation once as well as all the schemas types and interfaces we plan on reusing in all other adapters. Let's

start by creating a brand new package. So just like we did with CLI, let's go ahead and create a folder called core. Inside, let's go ahead and initialize another package.json.

Let's go ahead and open an object and let's give it a name sent- core. Let's give it a version of zero private set to true for now because we're not distributing this package yet. And let's

go ahead and give it a type of module. Once we've done that, let's go ahead in the root of our app and let's run bun install. What this is going to do is it's going to update the lock file by

registering the send kit core. So it's important that we do that before we start adding any dependencies here. Now let's go ahead inside of our packages and let's go inside of the new core and

let's go ahead and install the zod package. So now inside of your core package JSON, you should have a new zod dependency. What I like to do just in case is go back to the root and run bun

install once again simply so the lock file is successfully refreshed. Now let's go ahead and use this new zod package to create all of the schemas which we expect with this telegram

operation. So instead of defining the type like this where we basically hope that it looks something like this, we're going to be able to use ZOD to accurately parse and throw errors if the

type or the interface is different from what we expect. So what we are going to do is go inside of core and I'm going to go ahead and create a new source folder. And inside of core I'm going to create

schemas. ts. Inside of this file, let's go ahead and import Z from our new package. And let's start by defining the telegram message input schema. So this is what we

expect from the user to provide us with a chat ID and message. We expect both of those to be a string with a minimum value of one. In case this minimum value is not satisfied, we go ahead and throw

the error which is described in the next parameter. And then let's go ahead and define what we expect from the actual function which is going to invoke the telegram message. Meaning what are the

options of this function. So for now this is kind of unfamiliar to you. What is this bot token? Because if you take a look uh at the CLI source index in here, you can't really see bot token anywhere.

We extract the token directly from the environment file. Well, yes, that's fine. We are still going to use the environment file for now before we implement the actual distribution of

this token. But the thing is we are not going to uh call process environment within the core operation. So let me show you in this shared core. This is where we plan on developing the send

telegram message. Shared core doesn't know which environment it is in. It needs to be agnostic. It needs to work for the CLI. It needs to work for the local MCP server. and it needs to work

within a remote MCP server. So we cannot make this sendkit core rely on process environment. Instead the bot token is going to be transferred via a prop called bot token. So that is why we are

defining this even though we didn't really use it anywhere. Next let's go ahead and define the schema for the actual telegram API. So this chat id and message is what we are going to accept

and values that the user is going to give to us. But this one is going to be what we send to Telegram, right? So we have to write it in this specific way chat id and text because inside of here

take a look at the fetch method. That is what we expect, right? So right now if I go ahead and write this, you will see there is no error. Nothing is warning us that we just wrote an incorrect body

here. So to prevent that we're going to create a schema which is going to parse this. So in case we send something like that one two three it will cause an error because it does not match this

solution right here. Now let's go ahead and define the telegram response schema. So this is where we get rid of this ugly definition here. The reason I call it ugly is because it's technically a code

smell. So we wrote this type because we know it's supposed to look like this, but we don't really validate against it. Take a look at this. So all we do is we cast that type here. Meaning that this

data is guaranteed to technically have the description and have the okay, right? But with Zod and with this schema, we can actually parse it and Zod can throw an error and say, "Hey, I

don't know what you expect to got back, but it's not this. It's something else." So, you might be wondering when does that exactly happen? Well, imagine you accidentally uh used a different API. So

different endpoint and then this endpoint returns completely different thing from what we expect here. Why should it have a message ID or the description? So I just change this

endpoint and as you can see my code is never going to warn me that something is wrong. It's just going to break in an ugly uncaught way. So now I'm carefully going to return this back to send

message. Make sure you do that as well in case you've changed it. And that is why we are defining a schema for the response so we can accurately parse and check against this definition. So Zod is

going to throw a nice error and tell us, hey, I have an error. Message ID doesn't exist. I don't know what that is, but whatever endpoint you attempted to parse

this result from is not what you expect. And this type of thing is extremely important. Especially when building for coding agents, the more accurately you can give them errors, the better can

they provide solutions. So we are not doing this just so it's easier for us to develop, but so it's easier for agents to develop as well. And let's go ahead and add this one, which is Telegram

message output schema, which is once again what we plan on returning back from the CLI. So okay, chat ID and message ID. So I'm not sure if we really really have an example of that. We kind

of do. We define message ID. We have chat ID but we don't really return it back. Oh, we do. So chat ID and message ID. So just another schema so we can carefully uh keep track of that uh

object as well. So what this is is mostly uh graceful error handling because we are working with an untyped API endpoint. We don't really know what's going to return from here. So

instead of just hoping for the best and using JSON stringify with chat ID and text because we know that's what it needs to return or accept, we are going to stop doing that. We're going to stop

hoping for things and we're going to start validating things. So, if you haven't already, go through this code that I've written here again and carefully check that you didn't misspell

any of these values because if you did, you will get some errors from zod. So, pay special attentions to underscores or capitalizations like bot token and chat ID.

And the last thing we're going to do is one cool thing you can do with zod which is whenever you have a zod schema you can easily transform it into a type. So we're going to export three types. We're

going to export telegram message input which is going to use zod infer type of telegram message input schema which is the first one we've defined here. Then we're going to have telegram message

options which is the second one we defined here. And last, we're going to have Telegram message output schema. So you can see that now when you hover over any of these types, you can see the

exact type we expect. So now it's compatible to use within TypeScript and we can safely use it across our app by exporting these types that we need. So that's it for our schemas file. Now that

we've developed the schemas file, let's go ahead and create its neighbor operations.ts. So the first thing we're going to do in the new operations file is we're going to import everything we've just

developed in the schema. So telegram message output, telegram message options, telegram send message request, telegram send message response and two types, telegram message options and

telegram message output. And now we can develop a brand new function uh asynchronous function send telegram message. And instead of just casting uh objects that we are not really sure of or params

or arguments, what we can do now is we can define one argument input and we can set it to be telegram message options. So what do we expect this function to accept? You can see that when I hover, I

can now accept chat ID, message, and bot token. You can see how we didn't have to define this type. Instead, what we did is we've created the telegram message options schema. So we can use this to

validate whether the arguments the user has provided this function or later the agent has provided this function are correct. So again, the reason we are kind of complicating this, even though I

wouldn't really call this complicating it, I would call this quality code. Uh it's not just for humans, it's for agents. Agents need to be told when they're doing something incorrectly to

reduce hallucination. So that is how you build highquality MCPS and skills by validating all the arguments that are passed within functions. So once we uh know the input, we can

also define the output. But I'm going to leave this for later. Instead, I'm going to start by verifying that whatever this input has received is correct by using telegram message options schema.parse

and then we send the input inside. So this function is going to fail if whoever attempts to use this operation sends invalid input here which is again very important for agents so they don't

hallucinate and so that they know when they did something wrong. And the next thing we can do is we can prepare the request body. So for this one we use telegram send message request

schema.parse parse and in here we assign chat ID to come from our parsed input chat ID and text to come from the parsed input message and now that we have this request body uh safely parsed here so

this is now going to fail if chat ID is invalid if text is invalid or if you accidentally misspelled this it's going to break right so you are much in a much safer position now and what you can do

now is you can repeat that uh fetch request. So we're going to go ahead and open this template literal here and inside we're going to go ahead and write the send message API once again. So API

telegram.org bot and then inside of here we're going to inject from the parsed input bot token. So we don't have to directly use input.bbo token because we want to use it from this one which is safe

sanitized. So we know it's not injected with anything and it's 100% safe to use. Uh then let's go ahead and add a comma and let's go ahead and open the options here. So we're just going to repeat what

we did before. We're going to give it a method of post and headers content type application/json which leaves us with body for which we can just do response.json request body.ext.

So let's go ahead and compare how these functions look. So this is our new fetch function which we are developing here in the operations in comparison to CLI index.ts.

So you can see how in here we are using this very weird JSON stringify. We have absolutely no validation that chat ID is a string. We just hope that it's a string and the only thing we do here is

we check if it's available or not. Right? So not exactly ideal. Now let's go ahead and see what's going to happen with the response. So let's go back in the operations here. So what we're going

to do now is we are not going to just blindly cast the telegram response. Instead we're going to generate data by going over telegram send message response schema parse await response.json.

So now this is going to break if this response here is anything else from this okay result with the message ID and the description. So we are now parsing and counting on the response to return

specific items in a much safer way. You can see that when I hover over data, this is guaranteed to exist here. There is no chance that this isn't the correct type because we have validated it with

zod. So it's going to have it's going to throw errors if it's not that object. So we can now safely count on the response from this API here to have the correct arguments, the correct body and the

correct response. All thanks to Zod, which our agents are going to be very thankful for. So now I'm going to go ahead and throw errors in case we the response is not okay, if data is not

okay or if data result is missing. We're going to attempt to get the description or with a generic message telegram message request failed if we cannot deduct why it has happened. And then in

the end we're going to return telegram message output schema.parse okay set to true chat ID parsed input chat ID. And the message ID is now going to come from data result message ID. And

if you try and write something like this, you can see it now shows you an error. Why? Well, because the data is strictly validated. So even if you accidentally do this now, you can see it

will remind you, hey, no, no, no, this is from Telegram API response and they use snake case. They don't use camel case like we do, right? So this is also useful. This entire zot thing is very

useful if you plan on uh building this MCP codebase with agents with cloud code or open code or codec. Uh these types of errors are going to help guide your agent in the right direction. That is

why zod and type safety is so important in the age of AI. Great. So to wrap this all up, what we can do, this is not terribly important, but just to prove that everything works fine. You can see

we have one unused type, telegram message output, which is essentially what this function is supposed to return. So what we can do is we can add a column promise and then telegram

message output. And you can see that there is there is no errors at all because that's exactly what we return. So that is our operations solved. And now we can safely reuse send telegram

message for all of these adapters. We are now going to plug it back into CLI. Then we're going to develop local MCP server and we're going to plug it in there. And then we're going to do the

same thing for the remote MCP server. So just like that, we've created a very powerful core for our project which is environment agnostic, meaning that it doesn't care where it's in. Is it in a

CLI? Is it within an MCP or is it within a hono server hosted somewhere? Right? That's what we wanted to achieve a super types safe validated core which holds all the operations and everything

inside. So how exactly do we now plug in this core package into our existing CLI package? Well, what I would try and do is import send telegram message from sendkit- core. But you can see we have

an error here. So let's see what did we do wrong. First things first, let's check the name. I can see the name matches. Sendit- core. So that shouldn't be a problem. So let's see what it is.

And here it is. we didn't add it to the package JSON of the CLI package. So how do you add a package which is defined and developed locally within a monor repository and doesn't yet exist on npm

because usually you write the name of the package like scentkit and then you write some number. So, do we do this because our core sorry sent- core would be the name of the package, right? So,

do we do that because the version is 0.0.0? Well, not really because make sure you're doing this inside of the CLI folder package JSON because this is still going to look within npm. So, what

do we do? Well, we use workspace workspace colon and asterisk like this. So once you define the version like this, it's not going to search through npm. Instead, it's going to find the neighbor

here. So now let's go in the root and let's do bun install. And now if you take a look at bun.lock, lock, you will find that SendKit workspace packages CLI now has Sendit core, but it looks like

we still have some problems here. So, let's go ahead and first things first try and reload the window to see what's going on. All right, so cannot find module sendkit core or its corresponding

type declarations. So, what exactly is happening right now? Is our scent kit core ready to be used or not? One interesting thing you can try is you can add a forward slash and all of a sudden

it's able to actually go within and find operations. That's very interesting, right? But this isn't the most optimized way to do that. This would technically work but it would be nicer for us and

for all future developers for whom we are making this to be able to just import it like this. So in order to achieve that we have to go back inside of core source and we have to create an

index file. Inside of this index file we are simply going to export everything from schemas and everything from operations. But we are not done yet. We have to go inside of the package JSON

file here and then we have to add a property called exports and we're going to define a dot colon source index.ds. Just like that. Then you can go back inside of your index CLI and would you

look at that? We can now use Sendkit core and directly find send telegram message because we technically export all of the exports from operations. So send telegram message essentially gets

defined here. Send telegram message right that's what happens and that's why we end up being able to import it in this way. Now what I really like to do is just run bun install in the root just

in case the lock file uh is slightly different now and now that we finally have this here we can start removing some things from here and simplifying this uh entire telegram operation in the

CLI. The first thing we can immediately remove is this type telegram response. we are no longer going to need it because we no longer have to pretend that the response looks like something.

We instead know and we validate to make sure it looks like that. So we can completely remove that. Now you might be thinking why are we doing this validation right here if we also parse

the input that is going to be accepted. Well because of this process.exit. So this is a very specific uh command line interface uh quit that we are doing which wouldn't be a good idea to put

inside of the core. So technically later we could uh parse uh catch the on error of the parsing of the input and throw process.exit but for simplicity sake let's keep this small layer of

validation within the CLI just so it's easier for us to you know don't have to do some spaghetti code right now. Okay, so I repeat once again, the core needs to be agnostic. It needs to work uh on

the server. It needs to work as a local MCP. It needs to work as a CLI. So I can't just move process.exit, which is a very CLI thing into core because what if core is run on the server? It will shut

down the entire server. That isn't a good idea, right? But it needs to shut down the CLI because it's not a server. And now what we can do is we can remove the entire response from here. We can

remove the data. We can remove all of this pretty much. In fact, let's remove everything from here. And let's just leave this lightweight validation layer. And now we can use the send telegram

message for everything else instead. So we're going to do this within a try and catch method. And first things first, let's go inside of try. And we no longer have to write the API endpoint which is

always prone to errors. We can instead simply await send telegram message. And you can see that we have very type- safe and strict arguments that we have to pass. So we have to pass the bot token

to be the token which we are currently extracting via the environment variable. Then we have to pass the chat ID which we validate up here. And we have to pass the message which we validate up here.

And then we can hover over the result and you can see the exact structure that we are returning. So this is different from the structure that Telegram is returning because we have returned it

once again into an object that we find suitable so that we know everything is okay. So after this successful result, we can console log that the telegram message has been sent and the telegram

message ID and in the catch method we can now also capture errors in a safer way. So let's go ahead and do detail. Let's check if error is an instance of error and in that case let's extract

error dossage otherwise let's simply stringify whatever is the error argument and let's go and do a console error about why the telegram API request has failed and everything else is unchanged

so you can see how much modular and how better this is now when we no longer have to maintain the telegram operation types and interfaces within the CLI. So the CLI shouldn't need to know what the

Telegram output input is. That should be in Sendit Core. And same is true for the local MCP server and the remote MCP server. None of them should really bother with having all of that

architecture about the Telegram message. They are simply layers of communication. CLI is a layer of communication for a human. Local MCP server is a layer of a communication for a local coding agent.

And remote MCP is a layer of communication for an agent or a remote MCP server. None of them should have Telegram logic written inside. That's why we developed the shared core. So now

that we went uh go on to developing the local MCP server, we are not going to have to develop this anymore. We are just going to do await send a telegram message and it's up to us to make the

agent send us the bot token the chat ID and the message. That's all the agent has to do. The agent doesn't have to worry if this API endpoint is misspelled or anything like that. You can see that

this logic deserves to be separated from the CLI. There's no point for CLI to maintain this. Brilliant. So what should we do now? Well, we should check if everything works. So, let's go ahead and

do bun install and then let's attempt to send a message again. So, to remind you about how you get the chat ID, you have to get your telegrambot token and then you have to go onto api telegram.orgward

org slashbot and then simply insert your entire token here forward slashget updates. You can see that my result here is basically nothing. So if you want to refresh that all you have to do is send

a message again. So I'm going to send hello once again here. There we go. And let's try and refreshing this. And there we go. Once again, you will be able to find the chat ID. So, just inject the

chat ID which you just copied from here. And let me change the message. So, hello from dev CLI with shared core. And there we go. Looks successful. Let's confirm that it is hello from dev CLI with

shared core. Amazing. So, we just did a very big refactor which is going to save us a ton of time moving forward because we are not going to have to implement anything in the core again. Instead,

we're just going to continue developing the local MCP and the remote MCP which are going to import the core with all of the logic and operations and schemas and types ready to be reused. So what I

would suggest is just committing these changes so you can safely go on to the next lesson. So get addit commit dash m feature add or let's do extract shared core. As simple as that. And then you

can see I have no more uh uncommitted changes here. This isn't really required but I think it's easier for you if you do some commits so you don't accidentally revert your files. In this

lesson, we're going to build the main agentfacing interface, also called an MCP. As I've explained in the beginning, there are two types of MCPs, and we're going to build both of them. The one

we're going to build right now is called a local MCP. So, let's take a look at the diagram again to remind ourselves how this is going to work. The local MCP server is primarily meant to be consumed

by agents, specifically agents which run on your machine. The local MCP server is not deployed anywhere. Instead, it uses a standard input output transport which can basically run anywhere where it's

installed like on your machine, allowing agents like codeex or cloud code to use it to discover tools and serve as the primary agent interface. In comparison to a remote MCP server, this is very

similar to a local MCP server and it's built using the same SDK. The only difference is is that remote MCP server is deployed somewhere and then it's connected to another HTTP client like chatgpt.com

or cloud.com which don't have access to your machine and cannot use uh a standard input output transport. And the good news is that in the previous lesson, we've developed a package called

SendKit Core, which is basically the home for all of our types, schemas, interfaces, and operations, which means that we don't have to implement this. Again, all we have to do is develop the

actual local MCP server and then just import send a telegram message function. That's it. So you can see how much we've simplified our job by focusing on this one shared core which we can now reuse

across all of our adapters like CLI local MCP server and the remote MCP server when we start building it. Now let's go ahead and create the new package. So inside of our packages

folder let's create a new one and let's call it local MCP. Another standard practice might have been calling this uh standard input output MCP or STDIO for short. So that would be calling it by

its protocol or transport. But to keep it simple, I'm going to call my local MCP exactly that local MCP. And then later when I develop the remote MCP, I'm going to call it remote MCP. But if you

want to change yours to match the transport that they are using, so stdio and http transport, feel free to rename them like that. But I think it's simpler to call them local mcp and remote mcp.

Now let's go ahead and create package.json. Let's go ahead and open an object. Let's go ahead and give this a name of sendkit mcp a version of zero private set to true and let's set the type to be

module. Now let's go ahead and let's run bun install in the root of our app. What that's going to do is it's going to refresh the lo file so that it registers packages local mcp under the name

sendkit mcp. Now we have to add the model context protocol SDK which we are going to use to develop the MCP servers. So by googling model context protocol you can find the standard for building

MCPs which is developed by anthropic. You can even see on their blog post that they have opensourced the model context protocol which once again redirects to this exact package. So looking at the

documentation of model context protocol we can find the TypeScript SDK and this is where we get into a bit of a hiccup here. So what they currently write here in this big important note is that

version one remains the recommended version for production use. The reason I say this is a hiccup because this entire documentation down here is actually documentation for version two which is a

bit unfortunate right so you have to be careful if you're going to point your agents to this documentation uh or if you yourself are just going to try and follow along uh by installing these

packages which are going to be a bit different from what I'm going to do. So, since at the time of me making this tutorial, version one still remains the recommended version for production use,

that is what I'm going to teach you how to do. So, what does that mean for you? If you're watching this in the future and it says that from now on, version two is the default version. Well, the

good news is that version one will continue to receive bug fixes and security updates for at least 6 months after version two ships to give people time to upgrade. So, even if it's been

more than 6 months and you've only come across this video, uh I am quite confident that you can still follow along by just manually installing the exact MCP version that I'm using. And

then once you finish the tutorial, try upgrading to version two. Thankfully, you can use aentic coding to help you with that. The reason I'm telling you to still use version one is simply so you

don't stray off too far from what I am building. So, if you want to look at the actual version one API docs, go ahead and click uh right here. And this is where you will find what we have to

install. So I'm going to go ahead and go inside of my packages local MCP and I'm going to do bun add model context protocol SDK and that's going to install version 1.29.0.

So, for those of you watching in the future, if version two has come out and you want to follow with the exact same version as me, you can use the same version with simply pointing it uh to

that version like this. But then again, I don't think it's going to be a problem even if you have version two and you have to use version two. I think they are similar enough. The biggest uh

differences I see is that in here you have to separately install server and client whereas in here we have SDK and then from here we're going to import server and client. So I think they've

just separated some concerns and maybe slightly changed the API but I think it's mostly going to be very very similar for you regardless of the situation you found yourself. So in here

it also mentions something about zod. So I quickly want to go here just to read that. So the SDK has a required peer dependency on ZOD for schema validation. The SDK internally imports from ZOD

version 4 but maintains backwards compatibility with projects using ZOD version 3 or later. So that's why it also mentions to install ZOD. But I think that we don't have to do that.

simply because in this monor repository we already have zod inside as the peer dependency. So I think that this will work just fine even if we don't have zod. But in case you run into some

obvious problems mentioning zod, you can try going inside of local MCP and running bon add zod here as well. Now let's go ahead and manually add our core dependency. So, SendKit core added to

the SendKit MCP package JSON with this version basically the workspace version. And then we need to add -d types node inside of local MCP. And just in case, I'm also going to install ZOD. I don't

think it's going to hurt and I just want to make sure that this doesn't break. Great. So we have types node zod sendkit core and model context protocol. Since I'm using version one, it's SDK. So now

that we have these dependencies added, what I like to do is go back into my root and just run bun install. So the entire LO file is synchronized. Now let's go ahead inside of the local MCP,

let's create a new folder called source. And inside, let's create an index.ts. And now in here let's go ahead and import MCP server and uh standard input output server transport. Now here is

where you can see how imports for model context protocol version one looks like. So SDK server MCP.js then again SDK server standard input output.js. And looking at their GitHub

documentation here, that is about to change in version two. So the reason I'm even explaining this is just in case some of you come across this video and version two becomes the standard and you

really want to use version two, you can see that you have to install this package model context protocol server and then you wouldn't have to import from SDK and I'm not really sure if you

would have to import the extension. Perhaps they've also resolved that as well. Yeah, you can see that MCP server in version two is imported in a much cleaner way and std server transport is

also imported in a cleaner way. So in fact this is a pretty good uh migration start if you want to use version two and you will see that this API and this API is almost exactly the same. So it's

mostly going to be changes with the imports and the packages you are installing from version one to version two. Now let's go ahead and establish the MCP server. So I'm going to give

this a name of sendkit local and give it a version of 0.0.0. Then I'm just going to create a little helper function here. So in this function I'm going to define

get telegram bot token and this is going to read from process environment telegram bot token. Now this appears to be reading from our environment file right here. But that's actually not

true. So this is actually going to read from wherever the configuration for the local MCP server is defined which right now doesn't mean much to you but it's going to make sense once I purposely go

ahead and remove this later when we test it out. So you're going to see that it doesn't actually need an environment file to be run. So if the token doesn't exist, I simply

throw an error. Telegram bot token is required. Configure it in your MCP client environment. So you can see that I don't instruct the user to create an environment file. I'm telling them that

their configuration is wrong. And if there's no error, then we just return the token. So now let's go ahead and actually use this server which we've defined above to register a tool. So the

tool we are going to register is going to call is going to be called telegram and now we have to define the options for it. So title is going to be telegram description is going to be send a

telegram message and the input schema my apologies I forgotten to import it is going to come from the send kit core. So we don't have to write this again. We are basically reusing the same telegram

message input schema which we've used in our CLI function remember. So let me go ahead and find it. So the send telegram message here uses that schema, right? So we can now reuse it here for the MCP

server as well. So we don't have to define it again. That was the whole point of developing the core. Uh and let's also import from sendkit core the actual send telegram message

here. So we now have the input schema, we have the title and we have the description. And now we have to develop the actual function that does things. So it's going to be an asynchronous

function which accepts the input. And inside of here, let's go ahead and get the result by doing await send telegram message. Simply spread or pass along the entire

input. Why can we do this so safely? We can do this so safely because of the input schema. So there is no chance for this input to be something that send telegram message doesn't expect because

if this fails it's not even going to get to this point. That's why it is so important for us to define that core and all of that zod types. You can see that agents really really like using ZOD

because it's so easy to validate the arguments and say uh explicit and very specific messages about which arguments are incorrect so the agent can correct themselves. That's why Zod is so great

to use. That's why I had that separate lesson of separating everything into a core package which is then reusable across all of our other packages. What we have to do after we obtain the result

which you can hover over to see what it looks like. So we get the chat ID and the message ID. Well, we have to return uh a standardized uh object here. So for version one of model context protocol

that looks like this an object with a property content which is an array and this is basically a single object inside type text and then in here open back text sent a telegram message with this

message ID to this chat ID and then in the second property here we are just going to return the entire raw result without the structured response message. So this is basically what the

agent is going to respond to the user inside of cloud code or open code or codex right and this is to consume the actual structured content and that is actually how you write an MCP server. We

registered a tool called the telegram just like we registered a command uh called the telegram in the CLI using commander. That's why I wanted us to first implement the CLI tool so you get

the mental map of how this works. It's actually very simple. The same way you build the CLI tools is how they've uh defined this main interface for agents called MCPs. So they can invoke tools.

That's why I think it's the perfect example to do first because it really makes it easier. It makes you understand this in such a better and more structured way. And now we just have to

uh start this server. So in here we have created the server. In here we've registered the tool for this server to use. And now we have to open a transport. And just like you would

connect to some database server.connect to that transport. And that is actually it. That is how you build a local MCP server. And you can see how we didn't have to do a lot thanks to the Sendit

core which handles all of the operational business logic for us. So if you want to, you can take a look at the version two here just to see the differences. So new MCP server. I think

this is almost identical. Yes. So you can see no changes in how you create a new server. When you register a new tool, I think that also looks the same. So, register a new tool looks the same.

In here, we have a title and we have input schema, which we use our input for asynchronous and your return content. Yep, this looks exactly the same. So, if you're using version two, the only thing

you're going to have to change are the imports. That's it. Everything else is exactly the same. Beautiful. So we now have a local MCP server but we are not ready yet. There

are still some things we have to do. Starting by going back inside of package.json. So right now this local MCP server actually cannot be imported anywhere. So we have to specify exactly what we

export from it. So we export source index.ts. If you remember that's exactly what we had to do in core package JSON because otherwise you would manually have to find the path towards operations or

schemas. So we are making sure that user doesn't have to import MCP and then go to forward/sourceindex.ts which is ironically how they've made model context protocol

to be imported. We we are m actually better than anthropic in in this manner. Uh great. So now that we have that uh let's go ahead and register it in our main package JSON and then let's try

adding a configuration and running it. Now let's go ahead into the root package JSON. Let's go inside of scripts and let's register a new script dev local MCP bun run packages local MCP source

index.ts. So packages local mcp source index.ts DS confirm that it is working. And now let's go ahead and just test whether this works or not. Bun rundev local MCP.

And it should appear as hanging. That's the only thing we expect because this isn't intended to be run by us. This is intended to be run by agents. But if it is running and appears to be hanging

like this, it means it is correct. If it threw an error, that would mean we did something wrong. So how do we test this out? Well, by creating MCP configurations and opening cloud code or

open code. So let's go ahead and try that out. Let's go ahead and open code or cloud code, whatever you might be using. Uh the goal is to successfully add configuration for both. So let's

check it out. I assume most of you are using cloth. So I'm going to do that first and then I'm going to do open code. Regardless, if you go ahead and type MCP command in your clot code, you

shouldn't see anything related to send kit. So I have a bunch of MCPS here. You can see I've disabled all of them. The only one I have connected is from my web uh platform which is message kit which

you probably don't have. So you can ignore that. Basically what I'm trying to say is right now I have no MCP servers connected. Same thing in open code. If I open there are no MCPS

connected. So let's go ahead and go in the root of our project and let's create a file mcp.json. JSON. So this is a specific reserved name for clawed code. So in here go ahead and

open MCP servers. Register the server under the name sendkit. Type standard input output and then the command is going to be bun and the arguments will be run dev local MCP. Obviously later

this will be changed to the deployed npm published package but until we do distribution this is the only thing we can do that's why we've registered here local MCP and we've tested it to confirm

that it throws no errors and this is what I was telling you about this is the environment so when I told you that in local MCP the process environment will be read from a config and not from for

doten environment. That's what I meant. So for now, let's go ahead inside of environment. And be very careful here because mcp.json uh is not put under git ignore. So you

might accidentally commit it with your telegram bot token. So just be very careful. Okay. So I'm going to add the telegram bot token here. Okay. That's the first one I'm going to do. And since

I'm already creating these, I'm just going to create uh another one called open code.json. So if you don't use open code, you probably don't care about this. So you don't have to. But you can

see that in a very similar way, you develop the configuration for open code. So once again, I'm going to copy this and I'm just going to add the token here. Uh great. So now that we have these two,

let's go ahead and restart both of them. open code claude and you can see that it immediately found a new MCP server and it's telling me to confirm I want to use it. So I am

going to confirm use this MCP server. Let's go over MCP and let's go ahead and find send kit connected one tool and we can even see the command and the arguments here. We can see the config

location. We can click view tools and you can find the tool here which is telegram. You can see the tool name. You can see the full name which was constructed by the model context

protocol SDK. Description send a telegram message. Parameters chat ID and message. So the exact thing that we defined in here when we registered the tool here is the description. Send a

telegram message. That's exactly what we see here. Here are the parameters. input schema. You can see chat ID and message using zod. So we are 100% safe with using this uh MCP. And let me check in

open code here. There we go. Send kit successfully connected to open code. So now let's go ahead and send a telegram message using cloud code and local sendkit mcp. So once again, if you

forgot your chat ID, go ahead and send your bot a message using either Telegram desktop or Telegram mobile. And once you send a message to your bot, go ahead to apitlegram.org slbot.

And then go ahead and enter the entire bot token slashget updates. So, if you don't send your bot a message first, there's a chance the result might be completely empty. If that's the case,

just send the message and refresh and then you will see that latest message you've just sent. So, now that you have the chat ID, let's go ahead and try. So, use local MCP sendkit

to send a telegram message. And it should actually ask me for the arguments now. So there we go. What Telegram chat ID and message should I send? Let's provide the details here. So I'm going

to tell it chat ID message hello from open code local MCP. Let's go ahead send kit telegram and let's see if it's going to be successful or not. Send a telegram message. And would you look at that?

Hello from open code local mcp. Now, let's go ahead and do the same thing here. So, once again, I'm going to tell it uh use Sendkit MCP to send a telegram message. So, it should now load this MCP

that we confirmed is connected here. And once again, it should ask us for the chat ID. There we go. And the message is going to be hello from cloud code local MCP. Let's go ahead and press enter. And

if our configuration is correct, this should work. You can see that clot code asks for permissions. So, I'm going to say yes to proceed. And there we go. Successfully sent. Let's take a look.

Here it is. Hello from cloud code local MCP and hello from open code local MCP. We have successfully developed our first MCP server and we have successfully added to open code and MCP.json.

So if you want to commit mcp.json and open code.json, I would highly suggest just adding them to your git ignore so you don't accidentally uh commit these uh telegram bot tokens that we've added

here. Uh, I think there might be a way to actually inject them using the environment file. Uh, I'm pretty sure there is. I will try to research for the next lesson, but uh, just in case, put

them under git ignore before committing this lesson so you don't accidentally leak your Telegram bot token or if you already did it, just refresh your Telegram bot token, right? So no one can

use it. So uh we have successfully developed the local MCP server which uses the shared core which uses the external bot API which is consumed by an agent codex open code cloud code.

Brilliant brilliant job. Now once again let's go ahead and do get addit commit with a message feature add local mcp. That's it. something to save all of your changes so they aren't accidentally

overwritten. Amazing, amazing job. In this lesson, we're going to develop the remote MCP server. Previously, we've developed a local MCP server which is consumed by agents which run on your

machine like Open Code and Cloud Code. But in order to allow HTTP clients like chatgpt.com or claude.com to connect to the same MCP server, we need to create a remote

version of that same server. In order to achieve that, we're going to establish a lightweight Hono server which is going to serve a single endpoint MCP. It's going to be a post request with a very

simple URL authorization which accepts the bot token users have to configure in their connectors tab. Similarly as to how we needed to create a configuration for the local MCP. So what we've built

so far is a local MCP server and the CLI adapter. The local MCP server is very similar to what we have to build now. The only difference is the way we are going to distribute that to the agents.

The local MCP server uses standard input output transport which is fine when it's being consumed by MCP clients which we configure on our machine. So clot code, codex, open code. But if we wanted to

use the same MCP server and try to connect it to an HTTP client like chatgpt.com or claude.com, it wouldn't work. Because of that, we have to implement the remote MCP server. The

good news is the logic and the entire SDK is exactly the same as in the MCP server. We don't really have to do anything new, just some slight API differences. The biggest difference is

going to be that we actually have to create a very lightweight and simple Hono server which is going to expose a post request to an MCP endpoint and we don't have to develop anything in

regards to the actual interfaces types or operation business logic because we've already solved that when we implemented the shared core. Instead of developing this within packages like we

usually do, we actually have to create a different boundary. And we're going to do that by creating a new folder called apps. And inside of here, we're going to create the remote MCP folder. So why am

I developing this within apps and not within packages? Our packages folder holds reusable send kit units like the CLI, core, and local MCP. But the remote MCP has its own HTTP boundary. It's not

a package we are going to install or any of our users are going to install. It is a deployable application. And this boundary that I'm doing isn't my opinionated folder structure. It is an

actual practice which is recognized by majority of deployment and cloud services like railway. So when you have an apps folder, services like railway recognize that folder and the service

you put inside as something deployable and it doesn't do the same for packages. So that is why we are going to develop the remote MCP within the apps folder. But before we actually do that, we have

to go inside of our package.json and we actually have to add that here in the workspaces. So go inside of apps here, go ahead and add an asterisk and a comma like this. So make sure that

inside of your root package JSON, you support both apps and packages because so far we've only had packages here. And now that we've successfully registered the apps folder as the workspace for

this monor repository, let's go ahead inside of apps remote mcp and let's create a package.json. JSON. Let's go ahead and open an object. Let's give it a name of SendKit remote MCP, a version

of zero, private true, and type module. Then let's go ahead and install this. So it is registered in the lock file in the root of your project. So not within any

package or app in the root. Go ahead and run bun install. This is going to recognize the newly registered package and it's going to install it and register it in bun lock. So now if you

scroll down here uh well somewhere it's getting pretty large you will be able to find the newly registered oh here it is sentit remote mcp. Now let's go ahead within our apps within remote MCP and

let's go ahead and add types node as the development uh dependency and let's go ahead and add at model context protocol forward/ SDK. So once again a reminder this is the package for version one of

model context protocol. I've explained the difference between versions in the previous lesson. So if you are working with a different version, rewatch that lesson to see the differences in the

packages you have to install. And let's go ahead and add Hono here as well because we are going to need it to establish a server. So if you go inside of remote MCP package JSON, you should

now see the dev dependencies and you should see the dependencies. And we are missing one more dependency here and that is our send kit core which needs to use the workspace. So once you've done

that go back to the root and run bun install once again. So the log file is fully updated. And now we are ready to develop the remote MCP. Inside of remote MCP let's create a new folder called

source. And inside let's create an index.ts ts file. Let's go ahead and add all the imports which we are going to need. We are going to need to import hono from hono. We are going to need to

import MCP server from model context protocol SDK server MCP.js. And we are going to need to import a web standard streamable HTTP server transport from SDK server. And then once

again that exact transport. So you can see that this is very similar to what we had to do within our local MCP. The difference is in what kind of transport we are importing. So we are once again

importing the MCP server but instead of importing the standard input output transport, we are now importing the HTTP server transport because this is going to be uh an actually deployed service.

Besides that, let's import send telegram message and the telegram message input schema from our sendkit core. Now let's go ahead and create a function create server which accepts bot token as the

only argument inside of here. We're going to create a new server called sendkit remote and give it a version of 0.0.0. And then once again let's go ahead and register the tool. We can in fact copy

this entire thing here. Let's go ahead and copy it and then we are going to modify it if it's needed to be modified for the remote server. So you can just paste that entire thing here.

Server register tool. We are registering a tool called telegram. The title is going to be telegram. Description send a telegram message. Input schema telegram message input schema.shape.

And the only thing we're going to modify here is in this asynchronous function where we get the input, we don't have to spread the bot token and use the get telegram bot token. We can simply use

the prop which we have. Where does the prop come from? From here, bot token. Right? So this function is not going to be responsible for obtaining the bot token in any way. It's going to be the

developer's responsibility to pass it along somehow. All right. So, this stays the same and after that I'm just verifying that the return content can stay the same and it most certainly can.

So, as I said, uh not much difference in local MCP server and the remote MCP server when it comes to the API and the syntax. It's mostly about this hono server which we have to run and then

call this create server function inside. So, let's go ahead and do exactly that. Let's establish a new Hono application and let's go ahead and register a new API endpoint. So we're going to register

a post API endpoint which is going to use a bot token inside of the URL. So this is a param. So it's important to add a colon here. If you accidentally remove the colon then this is no longer

dynamic and it's expected to literally be written as bot token. So, make sure you put a colon here and then a forward slashmcp. And don't forget it's a post request. Then let's go ahead inside of

here and let's obtain the bot token. So, we can do that very easily using hono using context request param bot token. Bot token is a string. So, if the user goes a post request 1 2 3 MCP, bot token

is going to be 1 2 3. Now we have to create the MCP server using the function we've just developed above and pass along the bot token which we extract through the URL. Now let's go ahead and

create the transport using the web standard uh streamable HTTP server transport. Very long uh name. And set the session ID generator to undefined and enable JSON response set to true.

And then let's go ahead and simply connect our server to this transport. So very very similar to how we did it here with the standard input output server transport. Instead of doing it in the

file, we are now doing it within an API endpoint so that it can be connected uh via some other service. And then let's go ahead and open a try and catch block after the successful connection here.

And let's await transport handle request and simply pass along the raw request. And in the finally make sure to close the server. As simple as that. Now I would recommend also registering a very

simple not found route in which we just return a JSON with an error not found and a 404 status code simply so we can test uh the difference between an invalid API route and a correct API

route. And now we have to simply decide what which port are we going to run the server on. So let's just read from the environment file in case uh some service like railway assigns the port or let's

fall back to 3000. And then let's just go ahead and export default the port and fetch app.fetch. And that is the entire code we actually need for the remote MCP server. In order

to make this importable and usable, let's go inside of package JSON here and let's make sure to register exports and let's just export source index.ts as the entry point right here. So we are doing

that within remote MCP package JSON just like all of our other packages. Let's make sure we have an entry point to source index.ts. Now it's time to actually test this

server to confirm whether it's working or not. So let's go inside of our root package JSON and let's go inside of scripts and let's add a new script here called dev remote mcp. And the command

it's going to run is bun run apps remote mcp source index.ts and save the file and just verify that it actually exists that you didn't misspell it. So apps remote mcp source index.ts.

Now let's go ahead and actually run this. So bun rundev remote mcp. And there we go. Started development server http localhost 3000. If you visit the actual server, you should see an error

not found. This is expected because the only endpoint that's actually registered is the post request. And if you want to quickly test if your post endpoint is working, go inside of your terminal.

Make sure you have this remote running and simply do a curl post request to http localhost 3000. Enter whatever you want for the MCP token here and then forward/mcp and press enter. Here we are

still going to get an error, but it is not a 404 error. It is a 406 error. This is actually expected because the only client meant to consume this is an MCP client. So as long as it's not 404, it

means everything is okay. So how could we possibly test this on cloud.ai or chatgbt.com? Well, in practice, usually you would deploy this onto some service. You would

get a domain and then you would use that domain. But there is a way to test this out even before we deploy it. So make sure that you have it running on some port on your machine like localhost

3000. And now you have to use a tunnel to expose it to the web. You can do this in several ways. There are many services which do this nowadays. I personally like using angrock. It's something I've

been using for ages. There is also local tunnel. I think Cloudflare has some. And keep in mind that this step that I'm doing right now is completely optional because in a few lessons we are going to

deploy this entire thing and then we're going to properly connect this using our deployed uh web URL. But in case you can't wait and just want to see whether this works or not, you can go ahead and

set up Angro. That's what I would recommend. simply download it and you should have enrock on your machine like this. So once you establish what port you are on go ahead and do enrock http

3000 and that should give you this URL right here. It's basically forwarding your HTTP localhost 3000 to an HTTPS domain. The the reason I recommend Angrot is because local tunnel often has

uh a whole overriding page which asks for verification that you understand that this is a tunnel which breaks integration. Right? So let's go ahead and try and connect it using this. So

I'm going to do it for both chat GPT and Claude. I think that you should have you should be able to do this on the free tier as well. go inside of customize connectors. And as long as you don't

have any custom connectors, you should always be able to create one, right? So add a custom connector. I think you can only do this once. So if you already have one, you have to delete it or

upgrade to a paid tier. So I'm going to call this send kit uh sent kit. And now this is where we enter the URL. But that's not all. We have to authorize it. So how do we authorize? Well, I opted

for a very simple URL authorization, which means that I just have to copy my environment token here. I have to add it and then forward MCP. Basically, I have to target this

endpoint which we've just developed, right? Bot token MCP which and I don't have to specify that it's a post request. The MCP client is going to fire a post request here. Uh, perfect. So we

actually don't need this advanced settings, we don't have OAL. We just have a simple URLbased AL token. And just in case you're worried whether this type of URL authentication is a standard

or not, uh here's an example of Firecrawl, which is an MCP server that I personally use a lot and they actually do the same thing. So they use simple URL uh API key authentication whenever

you create a new MCP server and they don't do any authentication using oath. So this is a pretty regular practice. So you don't have to worry about that. Let's go ahead and click add right here.

And let's go ahead and see whether it has successfully recognized that we have a Telegram tool. So, how about we try opening a new chat and let's try and send a message to our telegram. So, once

again, let's obtain our chat ID. In case this is empty for you, the result can be an empty array. Just go ahead and send a test message to your bot and then refresh this again and find the chat

object and find the ID. So, I'm going to go ahead and I'm going to tell Claude to send a telegram message using SendKit MCP. I'm going to give it chat ID and I'm going to tell the message to be

hello from claude uh AI development, meaning local tunnel or or angro, right? So, I know which message uh comes from where. So, now it's finding tools and there we go.

Claude wants to use the telegram tool from Scentkit MCP. So I'm going to click always allow and message sent. Let's take a look. And here it is. Hello from claude.ai

development. Now let's do the same thing onto chatgpt.com. So in here you go inside of your profile down here settings apps and go ahead and click create an app. I'm going to call

this send kit. I'm going to select server URL. I'm going to paste that URL we just had in cloud code. So we use our uh local tunnel here. Then we use our environment key forward slashmcp. Make

sure it's https for authentication. Set no out because we have URLbased authentication and click I understand and want to continue. Let's hit create and see if it is successful. And there

we go. You're going to get a prompt add kit to chat GPT. In here you have some options whether you want to reference memories and chats to this. It really doesn't matter for us. Let's just hit

connect. And then let's go ahead and send a message. So this is what I'm going to say. Send a telegram message using SendKit MCP. This is the chat ID message. Hello from chatgpt.com

development. Let's go ahead and see if it will be able to find the MCP. So, it's looking for available tools. It's calling a tool. And in a few seconds, I believe. There we go. We have a prompt.

Do you want to send this or not? Let's hit allow. And that should be it. Message sent successfully. Status delivered. Let's take a look. Hello from chatgptt.com development. Keep in mind that this is

now working simply because we have a tunnel running. So the moment you close the tunnel, all of the MCP servers are actually going to break. So if you take a look at the server now inside of your

apps here, send kit uh and if you refresh, you can see that it fails. And it's also going to fail here. If you go inside of customize connectors, scent kit, not sure if it has refresh it. It

has it's also going to fail. So that is expected, okay? because this is just for development. Later when we actually deploy and we have a stable URL, we're going to add a new connectors. So the

moment you stop your local tunnel, all of the tools are going to break. And every time you start the tunnel again, you're going to get a different URL. So you're going to have to update it if you

want to test it out. So just some information for you if you want to show your work to someone. Now let's go ahead and verify all of our changes. I believe this is everything uh that we needed to

do. Beautiful package JSON. We have the export. Everything seems to be working well. We tested everything. So everything should be working. Let's go ahead and do get add get commit-m

feature. Add remote MCP. And that is it. All of our changes are now committed. Amazing. Amazing job. At this point, we've successfully developed the remote MCP server, but we didn't implement

proper authentication for it. What I mean by that is while we do have a very basic URL token authorization in place, that does not protect our MCP server or our endpoint. The only thing that

actually protects is Telegram's third-party API, which means that we need to think of something to prevent spam on our remote MCP server or to maybe give us an ability to only allow

certain organizations, groups, or maybe a company to use our remote MCP server instead of just allowing it to the entire worldwide web to use it. The ideal solution would be a way for us to

create an OOTH client and then use the advanced OOTH settings that connectors or custom apps within Claude and Chat GPT allow us to do, which will then make chat GPT or Claude prompt the user to

sign in instead of just blindly allowing anyone to use our remote MCP server, which will result in our remote MCP server being completely authenticated using the OOTH protocol. What would

usually require building login screens, registration screens, consent flows, OAL client logic, token validation, user management, and months of out plumbing can all be reduced to a few lines of

code with Clerk. Using the link on the screen, you can create a completely free Clerk account, which will give you access to 50,000 retained users for every project you create within Clerk.

Besides that, you can create unlimited applications. And all of those applications have their own limit of 50,000 monthly retained users, which aren't just regular signups. They are

users who visit at least one day after signing up. meaning that they are actually active within your application. So, this is more than generous for a hobby tier. Besides that, you get all of

this listed in their hobby tier right here. Once you've created a free clerk account, go ahead and create a new project. I'm going to give my application a name of SendKit. And you

can choose between all of these signin options. I'm going to keep it simple and I'm just going to select email and Google for now. We are not going to need organizations or billing. So you can

just hit create application. After you've successfully created your first application, go ahead and select the express documentation. The reason we're choosing express is because out of all

of the options here is closest to what we have, which is a Hono server. And once you scroll down here, you will see two environment variables, clerk publishable key and clerk secret key.

And you can copy it from here. An alternative is to visit the API keys page, which you can find inside of configure and then API keys. And once again, just select express because that

is the closest to HonoJS. and then simply go ahead and add those two variables to your environment file. Now let's go ahead inside of our apps and inside of remote MCP and in here let's

install clerk backend and clerk mcp tools package. Let's go inside of remote mcp sourceindex.ts and let's import from clerk backend clerk create client. Then let's go ahead

and extend our hono by also importing type context. Then let's also import generate clerk protected resource metadata from clerk mcp tools server. Next let's go ahead and establish the

clerk environment keys. So clerk publishable key and clerk secret key. Both of these will be read from our environment variable file. So make sure that you've added clerk publishable key

and clerk secret key. I always recommend copying and pasting here. So publishable key goes right here and secret key goes right here. This will ensure that you haven't accidentally misspelled them.

Let's go ahead and throw an error if any of those are missing so that we know that something is wrong and that we are missing the correct configuration. So only after we've confirmed that we have

the environment keys, we can safely initiate a new clerk client using those keys, the publishable key and the secret key. What we need to do next is register an endpoint within our Hono server which

is going to tell the agent where to find authentication or authorization information and that's actually the standard defined by model context protocol documentation themselves. So in

the initial handshake documentation, you can see that when the MCP client first tries to connect, our server is going to respond with a 401 unauthorized. And we're going to tell the client where to

find authorization information. In the example they've provided right here, you can see that they've stored it inside ofwell-nown uh path and that's exactly the path or

route that we are going to register and in which we are going to use the generate clerk protected resource metadata. So we can just return that and invoke that function within that

endpoint. Let's do exactly that. So after we define the new app using hono let's go ahead and register well-known oout protected resource and then once again bot token and then mcp in here

let's return a JSON which very simply invokes the generate clerk protected resource metadata which has its own object for the properties and passes along the publishable key from clerk and

the resource URL is a new construction new URL C request param but token slashmcp C request URL to string. This will ensure that it is passed along in the HTTPS protocol. So that's why we need to

reconstruct this URL so that it can be redirected back to it. The biggest problem with this redirect URL is that the protocol which I've just mentioned a moment ago often gets changed to HTTP

instead of HTTPS. So what we can do to fix this is modify the default fetch function from HON here. So I'm going to replace this with a new function which basically gives us

access to the raw request parameter constructs a new URL using request URL and then changes the URL protocol from the headers with a fallback. So make sure you don't misspell this. And does

the same thing to the host using the exact same method. And then in the end it returns app.fetch the fetch and then it constructs a brand new request. This will ensure that the protocol stays

HTTPS and doesn't accidentally uh get changed to HTTP. If this is confusing you perhaps once we actually use this and add it to chat GPD or claude, you can see the difference by leaving it

like this and then adding this and you will see that one breaks and the other one doesn't. For now, make sure you have this. Now, let's go ahead and add some helper functions which are going to help

us to authorize this bot token MCP endpoint which is currently open to the public with only the very simple URL bot token protecting it. Even though it's not protecting the endpoint, it's just

protecting uh the Telegram API. So what I'm going to do here is add a protected resource metadata URL helper which accepts the context and the bot token and it very simply returns back a new

URL using the well-known OOT protected resource bot token MCP which is essentially this API endpoint we've registered right here. Once we've done that, let's go ahead and also register

an unauthorized MCP response. So function unauthorized MCP response also accepts the context and the bot token and it sets the context header to this value here and the value of the header

to be this specific bearer which uses the function above protected resource metadata URL which passes along the context with the bot token. So what this function is going to do is exactly what

is described here. We're going to throw 401 unauthorized and then we're going to use www authenticate header to instruct the client where to find the metadata for Oout protected resource information.

So that is what we are doing. We are creating a reusable function which we can throw so with a 401 status with this specific header as instructed in the model context protocol documentation. so

that the client gets information about how to properly authenticate. So now that we have this helper functions, let's go ahead back to our bot token MCP post endpoint and let's go ahead and

actually protect it. So what I'm going to do is just as I've extracted the bot token from the params, I'm going to extract out header from the headers targeting the authorization key. And

then what I'm going to do before I attempt to create the server is check if the out header starts with a bearer and then an empty whites space value here. So I'm going to see if I have this right

here. If I don't, I'm just going to throw back unauthorized MCP response and instruct the client to where it needs to go to find the uh OOTH information. But if I do have that, I'm going to go ahead

and open a try and catch block. And I'm going to attempt to extract a request state using await clerk client which we've defined right here. Do authenticate request C dot request.

Accepts token oath token. And then I'm going to check the response of this request state. And if not is authenticated I'm once again going to throw unauthorized MCP response. And

finally in the catch I'm going to do the exact same thing. So if anything fails or if anything is missing, I'm redirecting the client to go to the uh newly registered endpoint which is

well-known oath protected resource. So if something goes wrong with authorization, I'm just going to redirect the client there so it can get the proper information about how to

authenticate because if this goes wrong, it means it didn't have the correct header. If the request state goes wrong, it means it's not authenticated in the first place. And if this goes wrong, it

means something broke in here. And the best thing we can do at the moment is once again redirect to well-known endpoint. Now let's go ahead and run the remote MCP server to which we've just

added OL authentication. you will have this message from clerk which means that we have successfully connected clerk to the remote mcp and now that we have this

running on localhost 3000 let's go ahead and create a tunnel which is going to expose that to an https URL now I want you to prepare claude chatgbt.com and also go ahead inside of the

configure tab within your application And the first thing we're going to do is go inside of developers and then OAL applications. And we're not going to create any OAL applications yet. Before

that, we're going to go inside of settings and we're going to enable the following dynamic client registration. That is going to allow Oout clients to register themselves dynamically which is a very

cool feature because it means that we don't have to manually add a custom OT application for claude instead it can register itself simply by reading the wellknown endpoint. So let's go ahead

and see how we can do that. I would highly recommend starting with Claude AI first because Claude and Chad GPT have some slight differences in how we actually add connectors or custom apps.

So using claude.ai, go instead of customize and connectors. If you have any existing connectors, click on them and then find the three dots button and click remove because on

the free tier you only have one custom connector. So go ahead and add it here. So what I'm going to do is I'm going to call this send kits and then just O so I can differentiate it. And I'm going to

go ahead and paste my HTTPS here. And then I'm going to go ahead and add my environment token here. So it's this one. It actually doesn't matter because we're not going to be demonstrating

Telegram right now. We're going to be demonstrating MCP. I'm sorry OT. But this is how the proper URL looks like. So your environment key and then forward slashmcp.

If you want to keep it simple, you can even do just any random number like this. But if you actually want to test sending a message, you're going to have to use the proper environment key. And

here's a cool thing. I'm not going to add anything in the advanced settings. I'm just going to click add. Let's go ahead and see what happens. So right now it's checking connection. Let's give it

a second to see the result. So the checking connection indicator kept spinning indefinitely. So what I did is I just refreshed this and then I clicked on SendKit O again. And then I actually

got this message. You are not connected to ScentKit O yet. And I have a button to connect. Let's click on it and let's see what happens. If we've implemented this correctly, we should get redirected

to clerk's login page, which is exactly what happened. And more interestingly, if you go back inside of your clerk's configure and then developers oout applications and do a refresh here as

well, you will see that claude has successfully dynamically registered its own oout application with all the scopes that it needs with the consent screen enabled. And it even added a proper

redirect URIs. And you can see that thanks to Clerk, we didn't have to implement or build our own login screen, register screen, token verification, email verification, social signin, OOT

client or consent screen. All of that comes built in with Clerk, allowing us to focus on building our app. And would you look at that? We have successfully connected to ScentKit Oout. And you can

see that now it can successfully read the available tools which are Telegram tools. And let's quickly give it a shot. So use Sendit Om MCP to send a Telegram message. Provide it with a chat ID and

then the message that you want to send. Let's go ahead and see if it will be able to access the tool. It should now that we have successfully authenticated. There we go. Claude wants to use

Telegram from Sendkit Oout. I'm going to hit always allow. And since we didn't modify any other code regarding uh the telegram which is actually kept separate in the shared core. You can see that

this worked successfully. Now let's go ahead and try and do the same thing within chat GPT. I'm going to go inside of my settings and then I'm going to go inside of apps. You can see that I have

removed my previous Sendit MCP and I'm going to create a brand new one. So I'm going to call it Sendkit Oout MCP. So I can differentiate between the other one. And what I can do is I can just go

inside of the connectors here out and it gives me a very easy way to copy the URL or you can just go inside of the terminal and then construct the URL once again. And you can see that

chat GPT immediately recognizes that I have some OOT settings here. And if you click here, it will actually uh tell you what it managed to load. And I'm going to show you the problem that happens if

you leave it exactly like this. So at first glance, everything appears to be perfectly fine. We have all the scopes that we want. It manages to read all the clerk endpoints. It has Open ID support.

Everything seems to be perfectly fine. But once we create and try to sign in, we're going to hit some problems. And I'm going to explain how to fix them. And now that we have this sign in with

Sendit OT MCP button, let's go ahead and click on it. And there we go. We get redirected back. And there is a problem connecting send kit o MCP try again later. And we can actually deduct what

the problem is by going inside of configure developers and then inside of O applications. As you can see chat GPT did manage to create its own dynamic OT application but it's missing some

crucial scopes like open ID. And this is actually a problem that's been documented by other people in the open AI developer community as well. But unfortunately, this discussion did not

result in a definitive solution. So what I ended up doing instead is created a custom allout application myself and gave it the scopes that I want. So let's go ahead and learn how to do that

instead. Step one is to actually delete the application that chatgpt attempted to create dynamically for itself. Let's go back inside of custom apps within chatgpt.com.

First things first, let's delete the one we attempted to create. Then let's go ahead and click create a new app. Let's go ahead and give it a name. I'm going to copy the URL from here and just paste

it. And then once again I'm going to select OOTH and I'm going to click advanced OOTH settings but this time I'm going to change from dynamic client registration to userdefined oout client

and then this will give me the information that I need to add to clerk and from clerk that I need to add here. So, starting with uh the Oout client secret, let's go ahead inside of add new

Oout application. I'm going to call it chat GPT. And I'm going to select all of the scopes. I'm going to set it to public simply because the original chat GPT dynamic registration uh set it to

public as well. So, I assume it needs it to be public. And then I'm going to click add. And in here I get my secret. So then I can immediately add the secret here. Then I'm going to go back here and

in the redirect URIs I'm going to copy the callback URL that's provided here. I'm going to paste it and I'm going to click add. And then in here I finally have the client ID which I'm going to

populate right here. This will automatically select to client secret post. And this is what works for me. So I'm not going to change it. If you've somehow lost the client secret, you can

always regenerate it. Make sure that you click save here. So this entire custom O is saved. And then we can leave everything else as is. Once again, click I understand and want to continue. And

let's hit create. And let's hope for a successful sign in this time. All right, let's go ahead and try sign in with ScentKit Oath MCP. And there we go. This time once we've created a custom OT with

all the scopes that we need, you can see that we can now click allow which will actually sign in and hopefully now redirect back to chat GPT. And there we go. Sendit OTM MCP is installed. And

let's do a quick test with the exact same message. use sent kit oath mcp to send a telegram message to a chat ID and a specific content. And once again, since we didn't actually modify the

shared core, there's no reason for this to fail. So, let's go ahead and click always allow. And since we are successfully connected, there we go. Message sent successfully. Hello from

Scentkit. Oh, wow. Let's wrap this chapter up by committing our changes. I'm going to go ahead and call this commit feature add OT to remote MCP. There we go. No need to push or anything

like that. Just something to stage and commit our changes. I just want to add a very quick disclaimer before we finish this chapter. At the moment of me recording this specific lesson, I have

actually finished recording the entire tutorial and I've decided to additionally add this lesson because I think it's very important and it completes the entire knowledge of MCP

servers. The reason I'm telling you this because chances are in the next few lessons I will open my remote MCP server code and you won't see any of the clerk MCP tools or clerk backend or the

well-known endpoint inside. That doesn't mean that you have missed a chapter where I removed all of that. It just means that I have already finished recording and building the entire

tutorial before I decided to come back and teach you how to do this as well. At this point, we've successfully developed the CLI, the local MCP server, the remote MCP server, and the shared core,

which means we have everything we need to develop the scale. But the problem right now is that we don't really have any of these adapters published or distributed anywhere. So the skill that

we would develop at this moment would only be useful for us locally. And that's not really the point of a skill. The point of a skill is so that it can be distributed and so that any user

anywhere in the world can use it. Which means that instead of developing the skill right now, let's go ahead and prepare all of these adapters to properly be distributed and published to

mpm, GitHub, or anywhere else we plan to deploy them. Right now, our CLI package works perfectly fine. As you can see, bun rundev cli with telegram command and two arguments for chat ID and the

message successfully send a telegram message which we can confirm right here. But the problem is if we publish this to npm it wouldn't work for anyone. The reason it wouldn't work is because right

now the CLI package is heavily reliant on our environment file. which means that if I go inside of my environment and temporarily remove the telegram bot token and try and run this again, you

can see that it's going to fail. So this is the experience that any user right now would get if they tried using this uh package and that's what we have to fix. So for now I'm just going to bring

this token back so we don't lose it and then I'm going to go back inside of CLI source index.ts. ts. I'm going to go ahead and I'm going to import home directory from node OS and I'm going to

import directory name and join from node path and then I'm going to go ahead and import all types of packages from node file system. So that's going to include exist in synchronized version, make

directory in synchronized version, read and write file, all synchronized versions. I'm also going to go ahead and install one more package into our CLI package here. So let's go ahead inside

of CLI bun add zod. So that's the package which we're going to need. Now let's go back to the root and let's just run bun install to ensure that log file is updated. Now that we have zod, let's

go ahead and import that as well. So inside of your packages CLI package JSON, you should now have zod. And now you can go ahead and import Z from zod. Now let's go ahead and define the

configuration path. So this is the path where from now on each user is going to store their own environment key when they first run this command. So that's going to be the home directory of this

userconfig folder kit folder and then config.json file. Now let's go ahead and create the CLI configuration schema using zod. So what each CLI configuration needs to

have is the telegram bot token which simply needs to be at least one character. Now that we've defined that, let's go ahead and define a function uh which is going to be used to write the

telegram bot token from users argument to users machine. So let's develop this function function write telegram bot token which accepts that token. The first thing we have to do is we have to

create this configuration path which we've defined up here. So let's use make directory directory name config path and set recursive to true so that it can create both the config and scenkid if

any of those are missing. So that creates the directory and now we need to write the actual file. So for that we use write file. We set the configuration path and then we go ahead and open back

backick literal sorry template literal or backick and we go ahead and immediately exit the back ticks and do JSON stringify with an object telegram bot token token. We set null and two as

the arguments and we end with a uh new line entry here and then we open object once again for the properties and we set this specific mode. So this is very specific to Unix uh operating systems

which basically means this file shouldn't be able to be read by anyone. Now on Windows it's not exactly as secure but for this tutorial it will serve its purpose. So that's how we are

going to store the token that the user provides us with. Besides being able to write the token to user's machine, we also need a function to retrieve it. So let's create that function. Get telegram

bot token. Now inside of here we are first going to throw an error if the path which we define right here doesn't even exist which means this function was never ever run before. So if not exists

config path throw the error telegram bot token is required please run sendkit in it. Then let's go ahead and try and get the configuration. So the configuration CLI configuration schema.parse

and we are basically using the configuration schema from zod and we attempt to parse whatever we currently have written within our config.json. We are using a specific UTF8 format

here. So it's parsible and readable. And if this fails, it technically means that the configuration file that we have stored is corrupted or incorrect. So that's how we are going to use zod

parse. That's why we are using it. We could technically just do you know JSON parse here. But then we would blindly allow the config to be anything. You can see the difference. Now it's type of

any. But if we do it through pars and you hover over then we know exactly what's inside the telegram bot token which of course can be optional in a sense that it doesn't have to be written

inside. But if it so happens that it is not written. So if this token is not existent we are going to go ahead and throw an error once again. Telegram bot token is required. please run uh sendkit

in it and then let's go ahead and simply return the token otherwise if everything else is correct. Now let's go ahead down here to the program definition and let's

go ahead and separate these commands. So I'm going to add a space here and I'm just going to once again call program here. So I have specific uh initialization with the name and

description and then I have specific initialization of the telegram command. So nothing really needs changing here. Okay. And I'm just going to change the description of this to send kit cli

backed by sendkit core. So it's a bit more specific about what it does. And now that we've separated these commands, we can go ahead and register a brand new command called in it. So this is what

users are going to have to run to store their token. That's exactly what we're going to add in the description. Configure the Sendit CLI local settings. And we are going to add a required

option Telegram bot token. The Telegram bot token. So users will have to provide our CLI with their uh API token. And then inside of this asynchronous action we receive options and we we receive the

telegram bot token. So that's exactly what we need here. And then what we have to do is we have to write telegram bot token using options telegram bot token value and we are going to inform the

user which file we've modified. So saved sendkit cli configuration to config path. So, it's going to render exactly what this is for each user depending on their machine because it's different for

every user of course. Now, you might be wondering how did we get this Telegram bot token camel case name because we never really specified it anywhere. We don't really parse it anywhere. How do

we know that we're going to have an options object and that Telegram bot token is going to be cased exactly like this with capital letter B and capital letter T. We didn't really specify that

anywhere. Well, the answer lies in the commander documentation. So in the commanderjs documentation here if we go into options uh we can find exactly how uh multi-word options are normalized. So

multi-word options like template engine are normalized to camelc case option names resulting in properties such as program options template engine with capital letter e. So that's how Telegram

bot token flag which we've defined right here gets transformed into telegram bot token property. We can read from the options. The reason I'm bringing this to your attention is because you can see

the obvious difference of how we extract the values in our telegram command which doesn't really work by extracting it from an object but instead it chronologically matches the arguments.

So if I called this chat ID one two three, it would still have the exact same value because it doesn't matter what this argument is called. It matters that it's first and this value is first.

This value is second and this value is second. With required option in commander it's different. It's not chronological. It is specifically by the flag name which gets translated into

this. Now that we have developed the init command, let's go back inside of our telegram command and let's simplify it. So first things first, we are no longer going to check for our token. And

we actually no longer need to check for chat ID or message either because these arguments are actually validated, which is something I didn't know until recently. We can also remove the entire

try and catch here. And we don't really have to console log uh sentences like this. Instead, it would be a better idea if we console logged the JSON stringify result. Looks like we have one stray uh

curly bracket here. So, I'm just going to remove it. There we go. And I'm going to indent everything inside. So, our action is much simpler now. We get chat ID message. we get the result and the

console log is a JSON stringify of the result rather than a sentence you know sent a message to this message ID and this chat ID. The reason we are changing this to be a JSON is for agents because

agents work better with JSON in comparison to some random sentence that we can write and they also use less tokens. So it's more explicit and uh more optimized for agents to simply see

a JSON uh output of the result. So now that we have removed the process environment token, how do we actually uh get the token from here? And thankfully we can just use our uh get telegram bot

token function from here. So we purposely used the sync version of all of these. So this isn't asynchronous. So we can directly consume it here. And one more thing I want to do is I want to

change the program to be await program parse async. And then I want to go ahead and capture any errors that might appear. And in the catch here, I'm going to console log the error with an attempt

to extract the error message. And then I'm manually going to attach the exit code. So this is actually the preferred way of catching errors within commander. what we had here worked. But this is

actually a smoother way of doing it. And just like that, we have completely eliminated the need for our Sendit CLI to depend on the environment token. Let's go ahead and test it out. So if

you attempt to run the Telegram command using the chat ID and a message, this time you're going to get a different error. Telegram bot token is required. Run Sendit in it. So this is a message

we are displaying but right now it still doesn't exist. So we have to run bunr rundev cli in it that's going to tell us that we need to pass a d- telegrambot token. So let's go ahead and add it here.

There we go. Saved sent kit cli config to users config sendkit config json. So it's going to be different depending on the operating system that you are using. Let's go ahead and try and get the value

out of it. So, users config sendkitconfig.json. And there we go. Telegrambot token. And you can see that my proper environment file has been stored inside. So, if I go

ahead and run the telegram message again, there we go. We have a JSON output that it was successful. Okay. True. Chat ID and the message ID. Let's go ahead and check it out. There we go.

Hello from dev CLI. And to confirm it works one more time, I'm just going to add some numbers to it. And there we go. So, we have successfully adapted our CLI package so that it no longer depends on

the environment file. I would still recommend keeping it here just so you don't lose it and so you have quick access to it. But the CLI package is itself no longer depends on anyone

having that on their machine. meaning it is ready to be distributed. Now let's go ahead and commit our changes. Get add dot and let's do get commit feature um improve the CLI config. There we go.

No need to push anything. Let's just make sure our changes are committed so they don't get accidentally overridden. In order to prepare our packages to be published, we need to introduce some

kind of type check, linting, and formatting to ensure that builds don't fail and so that we can successfully deploy and publish these packages to npm, railway, etc. There's a wide range

of tools you can use to format and lint your code. Chances are you've probably encountered a tool called slint or maybe a formatter called prettier. You might have also seen a modern one called

Biome. The one that I'm choosing for this project is Oxidation Compiler, also known as OXC. I think that in comparison to all of the other ones I've shown, it is the easiest to set up. It is the

fastest, the most optimized, and it's simply lightweight, and perfect for this project. Additionally, it's also made by void zero team which is the team that currently maintains the vit project

which you use every time you need to start a new react app. It is also the team behind the bundler which we are going to use to successfully compile all of the packages that we are using. So

because of that I think that oxc is the perfect llinter and formatter to use in this lightweight project of ours. In the root of our project let's go ahead and install a few development dependencies.

This will include the ox compiler formatter the ox compiler lint tsd down typescript and types node. So all of these are development dependencies and let's add them in the root of our

project. So once you go inside of your package JSON not in any package or app but in the root you should now have types node ox formatter ox lint tsd down and typescript. Now let's go ahead and

create a configuration file for the formatter. So go ahead and create a oxmtrc.json. JSON file and inside open an object and target the following schema. So inside of your node modules ox formatter

configuration schema.json and in the ignore patterns simply go ahead and add bun.lock. Now let's go ahead and add the configuration for the llinter. So again oxlint rc.json JSON

file inside once again open an object target the schema node modules oxlint configuration schema.json JSON for the plugins set TypeScript unicorn and OXC categories correctness error suspicious

warn I'm going to leave the rules empty and the environment builtin set to true that is all the configuration that we need for oxc to test it out let's go ahead inside of package.json JSON and

let's go inside of our scripts. I'm going to go ahead and add all of these scripts here. So, we're going to have a new format script which will use ox fmt-right format check which will have a flag

check lint which will call oxlint and deny warnings and lint fix which will use the flag fix. So, make sure that you've added these four new scripts to the root package json. Let's go ahead

and try running bun run format colon check. This is going to print out all of the files which have some formatting problems in our codebase. Now let's go ahead and try running bun run lint. We

have no lint errors which is great. So we appear to be having some format errors. Keep in mind that in your case you might have some lint errors and that's no problem at all. The reason we

are doing this now is so that we polish our code before we deploy it or distribute it anywhere. So we always know that it is safe to deploy and won't crash for our users. So how would we fix

these issues? Well, one easy way of doing this is simply by calling the format instead of format check. Format check, as you can see, uses the check flag which simply outputs the

problematic files. it doesn't fix them for us. So if we wanted to fix all of them at once, we would just have to run the format instead. Same is true for lint. If we want lint command to fix all

of the problematic files, we would run lint fix instead. But there is also a way to do this individually for a single file from your IDE. So I'm going to go ahead and choose a random file packages

cli source index.ds. DS. How do I fix the formatting issue from here? The answer is by going inside of the extensions of your IDE and finding OXC. This is obviously if you use Visual

Studio Code or Cursor like I do, which share the same uh marketplace. If you use something else, maybe you won't have this available. So, in that case, you're just going to use the fix commands. Once

you successfully install these extensions, you can actually see them down here. OXC is loaded and it has the proper configuration files. If you didn't add the configuration files, it

will actually throw an error. So, this means everything is fine. But I can still see this X button right here. So, I'm going to click here. And you can see that formatting has an error. There are

multiple formatterers for TypeScript files. One of them should be configured as the default formatter. So, I can click configure here or I can go ahead and just use format document here. And

then it's once again going to prompt me to choose the default formatter. So I'm going to choose OXC. And just like that, you can see that it has modified this file. So I'm going to show you the exact

diff changes of this file. No functionality has been modified. You can see semicolons have been added or removed and some indentation or new lines have been removed. No

functionality has been changed. You don't have to worry about that. So now this CLI index source is not going to appear on subsequent format check. You can see that I no longer have that file

listed here as problematic. So I just wanted to show you how you can fix individual files uh using your IDE. So to not waste any more time, let's go ahead and run bun run format in the root

of our app, which is simply going to update all programmatic files. And we can do the same with lin. So instead of bun run lint bun run lint fix if you have any problems at all. So this will

automatically modify all files and you can see that now I have several files which are modified but none of the functionality has been changed only linting meaning um my apologies only

formatting and linting meaning indentation new lines line breaks things like that nothing that fundamentally changes the functionality. So I had I don't know 14 files changed. You might

have 20 or maybe you had two files changed. It doesn't matter. But this is the script that we are going to run before we deploy our projects. So everything is nice and clean. Now that

we've solved linting and formatting, let's go ahead and add one more script here in the root called a type check. So this will very simply uh verify our code against the TS configuration. Now we

know that we don't have any type errors right now because the files would be read within our IDE but just in case we can go ahead and do bond run type check and that is going to go

through all of our files and tell us if we have any problems. So these often have to be solved manually because uh there isn't really a way a script can fix them for you. So they aren't l

linting issues or formatting issues. They are most likely incorrect code which break TypeScript which is even more important to fix uh before distributing and deploying. So if you

happen to have some type errors here which I don't feel free to visit the source code and then verify my code against yours to see where the problem might appear. And one more thing I want

to do is the reason I added types node to dev dependencies in our package JSON is because I've noticed we have some inconsistencies here. So in a package like core we don't have uh types node.

In the package like CLI we have types node in local MCP. We once again have types node in our apps remote MCP. We once again have types node. So it doesn't make sense

that all of them uh maintain their version of types node individually. I think the reason we started adding this is because uh the CLI was the only package in the beginning. So we forgot

to clean it up. So I think this is a perfect opportunity to do that. Make sure you have one types node installed in the root of your package JSON and you can then go into individual packages. So

local MCP package JSON. Let's go ahead and remove the dev dependency from here. Then let's go inside of core package JSON in here. We don't have it. If you do, you can remove it now. And inside of

CLI, let's go inside of the package. JSON here and let's remove that and the trailing comma. And last one is the remote MCP. So once again, dev dependencies. Let's remove

that and the trailing comma. So now let's go ahead in the root and do bun install. After you've done this, I would recommend once again running bun run type check, bun run format check, and

bun run lint to ensure you have no warnings, no errors, all files match, match, and use the correct format and nothing is wrong regarding our types. And this is now a perfect checkpoint

before we start distributing and publishing our packages. They are now type safe, formatted, and linted. But we already have several changes here and it's getting kind of hard to define the

boundary between this lesson and the publishing lesson. So let's make this easier for us and simply commit all of these files. So I'm going to say feature add lint and formatting. There we go.

And now we are ready to start distributing our packages. In order to start distributing our packages, we need to create an npm account. So go ahead and do that first. Once you've created

your npm account, let's go ahead onto our profile. And let's create a new organization by clicking on the organizations tab and then add new organization button. In here, the name

needs to be unique. Feel free to use the name of your account as it recommends here. Chances are that's not going to be taken. And choose the unlimited public packages which is a free option. So you

don't have to pay anything. Once you have created a new organization with a unique name, you will see it listed here under organizations. And inside you will see that you have no packages listed.

This is of course if you created a new organization. If you want to use an existing organization, that's perfectly fine. You can see that in this one, I have a couple of packages. But to make

it easier and so that we are all on the same page, I'm going to start from a completely empty organization. And we're going to learn how to add public packages here. What you have to do next

is connect your command line interface npm to the npm account you've just created. So if you type npm who am I, chances are that you're going to get this error. unauthorized. So the next

step you have to do is npm login. And once you've successfully logged in, go ahead and try the who am I command once again. And it's going to print out your account name. Now we have to rename all

of the packages which we plan to publish on npm to belong under the organization which we've just created. The reason we are doing this is so that there are no name conflicts when you try to publish

your package because chances are someone already took the name scentkit or whatever you've named uh your project. So with this method you can publish your packages and name them whatever you want

and they are simply going to be scoped under the organization name you've created. So go inside of your organizations and find your organization name. So for me that is CWA-DEV.

The first package we know we are going to publish on npm is the CLI package. So let's change the name to be CWA-dev/sentkit. So from now on this is the name of that

package. Now let's do the same for the rest of our packages. So our core package is no longer going to be named Sendkit core, but instead it's going to have a prefix of our organization name.

And same thing is true for the local MCP. Instead of sendit MCP, it's going to be prefixed with our organization scope. So the only packages we've had to do this to are the packages which we

plan to deploy or publish on npm which means that for our apps remote MCP we don't have to change anything in regards of the name of the package because it's not going to be published under any

organization it's just going to be deployed somewhere but that doesn't mean we are done take a look at the dependencies here it's expecting to use scentggetkit core from this workspace

but Right now there is no sentit core because we've renamed it to CWI dev sendkit core. So because of that go inside of remote mcp package json and change the name scentkit core to be the

proper rename which we just did. Now let's go over all the other package jsons which might need this changed. For example the cli package and its package json. It's also using ScentKit core. So

let's change that to be the new name. Now let's go ahead and check the local MCP package JSON. Once again, it's using ScentKit core. So let's change it to the new name. And then one thing we can do

is just do a search for SendKit core and close the LO file. There we go. So now we know that we fixed all the package JSON files, but we still need to fix the imports. The imports are not throwing

errors right now because we didn't refresh the LO file. So I think it will be better if we do that first. So make sure that you have modified all of your package JSONs to no longer use scent kit

core but instead to use the new renamed package. And also make sure that your core is scoped to organization that your MCP is scoped to organization and that your CLI is scoped to an organization.

So you should no longer have sentit core anywhere in the package JSONs in the root of our app. Let's go ahead and run bun install. As you can see this is this has removed three packages and it has

installed three packages. So now that lo file has been refreshed. If you search for scentkit core once again here and perhaps if we reload the window uh this should start to throw us some errors.

What I recommend doing as well is also doing a complete delete of your node modules and then run bun install again and then go inside of your IDE and simply reload window or just restart

your IDE and at that point you should start seeing errors for any existing scent kit core. So what I'm going to do now is search for sentit core within my project here and I'm going to fix file

by file. So the first one I found is within remote mcp sourceindex.ds. So instead of sendkit core I'm going to change it to the package we've just created and I'm going to collapse this

for you so you can see the full name. So cwa-dev sendkit core for you. Of course this organization name is going to be different. And as you can see now we have no errors. So let's continue. We

have two more files. So this one is within packages. CLI source index.ds. So our CLI index had an incorrect package. And now it has the correct one. And let's search for the last one. And this

one is located instead of local mcpindex.ts. So once again change the broken package to the new package which works. And I'm going to collapse so you can see the full name in my case. Again, for you

this will be different depending on your organization name. Now that we have our package names in order, let's go ahead and add the actual build or bundle scripts. So the first package we want to

do this on is the core package because every subsequent package of our entirely depends on this. So what are we going to use for bundling TypeScript into distributable JavaScript? So we already

saw a sneak peek when we added ts down in the dev dependencies of our root package JSON. So if there's a chance you don't have this, simply go ahead in the root and bun add- you can see the exact

uh line of packages when we also added tsd down. So this is the one that we care about and we are now going to use it to bundle. So you can read more about TS down on its website. And fun fact,

it's also made by void zero which is the team behind uh VIT and behind our formatter and llinter that we are using. So now that we solved that, let's go inside of core here and let's create uh

a tsconfig.build.json file. So this file is going to extend the root tsconfig. So it's going to target this tsconfig at the root here and it's going to extend on it with this

compiler options. This is what it's going to include. So make sure you have the source folder otherwise it's not going to work. And it's basically targeting every single TypeScript file

within this source folder. And it's going to exclude the dist folder and the node modules. So that's what we need for the tsconfig. And now we also need to add a tsdown.config.ts.

So go ahead and import define config from tsd down. Go ahead and set the entry to be sourceindex.ts and then make sure all of the configuration looks like this. The out

extensions are going to be js for all JavaScript files and d.ts ts for all type files. So we are going to have fully types safe packages this way in a standard industry pattern that is

expected whenever someone installs a package. In here you can see that we explicitly mention to never bundle zod because zod is the only dependency that we have for the core. So because of that

we want to make sure that we don't accidentally bundle that inside of our package. So in order to test if our tsd down configuration is working, let's go ahead inside of the package json of the

core package here and let's add a scripts build and a very simple command tsd down. We could technically go ahead and change directory within our packages core and then run the build script, but

I think it's easier if we make it so that we can run the build script within the root package. So inside of the root package JSON after formatting and linting let's go ahead and add build

core which will do bun run d-filter and then use the package name which we registered in this package json. So double check that your core has that name. Whatever is your name for this

package go ahead and add it here and run build script from that package specifically. So, make sure it's named build. Let's go ahead in the root of our project and run bun run build core. And

you can see that it successfully bundled uh our core package using ts down. So now within our packages core, you should see a dist folder and inside of here you should see index.d.ts

which carefully stored all of our types. We also have index.js which is the compiled JavaScript code and we have a map file right here. So industry standard production ready bundling here

ready to be distributed. Now let's go ahead and do the same thing for other packages. Let's go ahead and do it for the CLI package next. So inside of CLI let's add a tsconfig.build.json.

Make sure you have the exact same properties inside. And then let's go ahead and add tsd down.config.ts. In here, it is extremely important that your dependencies correctly add the

neverbundle property. So inside of the CLI package, inside of package JSON, you can see the dependencies commander, our sentit core scoped under your organization, and zod. So those three

dependencies need to be omitted from bundling here. So make sure that those are the exact ones which you add here. I would suggest copying and pasting from dependencies so you don't accidentally

misspell them. And now let's go inside of the package JSON of the CLI package. Let's go ahead and add scripts. And let's go ahead and register the build script which very simply invokes the TS

down. And now that we've registered the build script to the CLI package JSON, let's go to the root package JSON and let's register build CLI script which is going to filter to the sendkit package

because this is what we named our CLI package. We simply call it sendkit. So there is no send kit CLI. It's just sent kit and we call its build script. So once again, double check that this name

is exactly what you see here in the CLI package. JSON right here. And then let's go ahead and try bun run build CLI. It uses DS down. And there we go. We successfully built that as well. And now

let's do the same for the local MCP package. So we start by adding the tsconfig followed by the tsd down file. Inside of the tsd down file, make sure you target source index.ts

and make sure that inside of the never bundle, you add sendkit core and model context protocol. But let's check if that's all we need to do. For example, we also have zod here. So let's go ahead

and add that as well. So always double check with the actual packages that you have inside. So all of these dependencies need to be omitted here in the never bundle. Now let's go ahead to

the package JSON of the local MCP. Let's go ahead and add scripts build dsdown. And then just like for the previous two, let's go inside of the package JSON here

and let's registered build local MCP to target our scope sent MCP build. And let's go ahead and try it out. So bun run build. This will be local MCP. And there we go. So all three of our builds

are successfully working. At this point, once again, it's a good idea to stage all of your changes. feature add build scripts to packages. So all of them are committed and so you don't lose all of

these changes now that we are in a state where we can successfully create a dist folder for every package which we plan on publishing. So we can now adapt the package JSON to read from this generated

dist folders and publish that information to npm. Now that we have the ability to bundle or build our packages, let's go ahead and modify their package JSON manifests so that they are

compatible to be published to npm. Let's start with the core package as this is the one that all other packages depend on. Inside of the core package JSON, the first thing I'm going to do is after its

version, I'm going to add the files property. As you can see by its definition, the files field is an array of files to include in your project when published. So the ones that we are

interested in to be distributed to npm is the dist folder. We don't really care about the source folder. We care about the dist folder because this is where the bundled files are going to live. And

since we're about to publish this package, it's no longer going to be private. So let's go ahead and remove that property. Now let's go ahead and add a few more elements here. So before

exports, let's go ahead and add main module and types. So we are going to target the dist folder and we're going to specify the main field which is the entry point to our program. We are going

to add an ECMAScript module ID which is once again the primary entry point of our program but for ECMAScript and we are going to specify the types property to point to our bundled declaration

file. So thanks to tsd down we have all of those. So inside of the dist folder we have index.d.ts and index.js. Now let's go ahead and slightly modify the exports here. So the entry point

will stay the same but it's going to be an object and we are going to um separate the types and the import. Once again make sure that you are targeting index d uh d.ts and index.js for the

import. After the exports we can go ahead and add a whole new property here called publish config and give it an access property of public. And the last thing we have to do is add a few more

scripts after the build script. So that's going to be pack colon dry which will run bun run build which is essentially tsd down. And then it's going to run npm pack- dry run. And

we're going to add a pre-publish only which is a reserved file name. As you can see the definition here run this before the package is prepared and packed only on npm publish. So this is a

reserved name. So you have to call it exactly this. So before we publish to npm, we are going to make sure that we do bun run build and save this file. Now once again so we don't have to enter

this package every time we want to build pack or publish. Let's go ahead inside of package.json in our root file. And after the development scripts, let's go ahead and add release pack core, which

will run bunr run-f and then the name of our core package and simply invoke pack dry. Okay, so make sure that this name right here cwa-dev/sentkit core is exactly what you have in the

core package json here. So that's exactly what I have here. So feel free to copy it and then just paste it here. Okay. Make sure you also have this script pack colon dry. So this is the

exact script which we've added right here which runs the build and npm pack. So what I can do now is from the root of my app here I can bun run release pack core which is going to run uh which is

going to build using ts down and then it's going to do npm pack- run. Now let's go inside of this built and npm packed package. So inside of our packages core and let's go ahead and do npm publish-

public. So once again it's going to run build. And now we have to authorize our npm account. So let's do that. And once you've authorized you will see a successful output here of a new package

under your organization with the name Sendkit core and the version 0.0.0. And of course, if you now go inside of your new organization here, you will find this published package, SendKit

Core with version 0.0.0. So now that we've published the core package, let's go ahead and publish the CLI package. Let's go inside of the CLI package JSON. Let's go ahead and remove

the private flag. Let's go ahead and add the files property to once again be this. Then let's go ahead and once again after the type module add our main module and the types all to read from

the dist folder. And let's go ahead and modify our exports. So I'm going to add it right here. It looks like we didn't have it before. So make sure you have it now. Exports to separately import the

types and the actual entry point. So inside of your list here, make sure you have index.d.ts and index.js. Besides that, let's go ahead and also define the publish config and set it to

access public. And let's go ahead and add two scripts besides build here. Pack dry and prepublish only bun run build. But we are not done yet. So let's take a look at what this is. This is a CLI

package which means that users are going to install it on their machines with an intent to run it in a binary. So they will probably want to do something like Sendkit. So how exactly do we register

what name gets installed once the user does mpm install-g and I assume it's going to be the name of my organization forward slash sendkit. Right? So how do we know that

from this installation point they get this as the command? There is a property for that as well and it's called a bin. So inside of the bin go ahead and tell give it the name of the command which

you wish to be executed. So scentkit and make it target the entry point like this. So once the user installed this the sentit is going to be the name of the actual command. So if you change

this to send kit one two three in that case it's going to be send kit one two three once installed. There is one more thing we have to do before we establish the CLI package as something executable

and that is by going inside of source index.ts and at the top of the file very important before anything you need to add a sheibbang. So a shebang is basically an instruction which tells

your computer uh what program should run this file. So we are going to specify for this to be node. User needs to have node installed on their machine if they wish to successfully run our send kit

command. So make sure you have that and save the file. Now you might be thinking once we actually publish this to npm what will this dependency resolve to because right now it's written as

workspace which basically means for our local development simply use this folder right here but when we publish this on npm it's going to be a little bit different won't it so should we

explicitly write our core version here which we've just published on npm Or is there a way that we can keep the local version for our development purposes and every time we do npm pack and npm

publish somehow magically resolve this to whatever is the latest version. Well, there actually is a way we can do that and that is by not using npm packac and npm publish but instead using bunpack

and bun publish. The reason we need to use bun for this is because we are already within uh bun as the monor repository. So in order to use its monor repository quirks we have to use bundev

tooling for this. So let's go back inside of packages cli package.json JSON and to ensure that this workspace always resolves to the latest published version of that package because we just

published scent kit core and so that we don't have to manually change this to 0.0.0 zero which complicates whenever we want to test something locally here right let's go ahead and change this

script backd try to not be npm packac but instead bun pm pack you can find the documentation for bunpm on their website under the package manager so bunpm is basically package manager utilities and

it offers the pack command which is the same as npm pack so it even has the exact same option here dash dry run. So I would recommend actually changing the same thing in core package JSON right

here. So change this from npm pack to bunpm pack. I purposely didn't want to do this uh for core because I wanted to simplify it and just say we're using npm. Let's

use the npm command to publish it. Bun is fully compatible with npm and since we are using a monor repository, it's actually quite handy for us to use bundev tooling. It doesn't make too much

sense to use it in scent kit core because scent kit core doesn't depend on anything besides zod. But the moment we try to publish a CLI package which depends on the core package, we run into

a problem because this workspace alias right here means nothing to npm. If you try to do npm pack and npm publish, I'm pretty sure it would throw an error here because it has no idea what version is

this, where am I reading this from, right? So, npm isn't aware of the bun workspace within which we are working. So, for the pack dry, just make sure you're using bun pmpack d- dry run here

in the CLI and also in the core right here. And now, let's go ahead and register all of this scripts we've just made for the CLI package into the root package. JSON right here. So right after

release pack core, let's go ahead and add release pack CLI bun run filter CWA-dev sentit pack dry which is now going to use the bun variant. So in the root of your project, let's go ahead and do bun

run release pack and let's see the output. As you can see, we have successfully uh bundled it using tsd down. And then we run bun pmpac dry run, which has successfully created the

tarball and simulated that it correctly works. So once we've done that, let's go ahead and go within our packages CLI and instead of doing npm publish, so this would be the usual. Let's go ahead and

change this to be bun publish. And as you can see, it's doing the exact same thing. It's building it and then it's asking us to authenticate with npm. So regardless of the fact that we just used

bun publish, bun doesn't have its package registry. It's using the npm registry. So it's the exact same process but the difference is is that it resolved all of those uh internal

aliases for versions within our monor repo and its packages. So go ahead and authenticate and after authentication you will see a successful output of a brand new package being registered on

npm called scentkit with a version 0.0.0 zero. And if you go within your organization, you will find that brand new package. And inside of here, you will find three dependencies, ZOD,

Commander, and our previously published package, ScentKit Core, meaning that it correctly resolved the version of this deployed published package. You can even go inside of ScentKit Core and click on

dependence. And even though this doesn't immediately resolve once you actually click on the number here it will show you that there is one dependent on sendkit core package called scentkit.

Now let's go ahead and test if the package is actually working. So I'm going into the root of my uh entire machine here and I'm going to go ahead and install CWA scentkit globally and

let's see what happens once I type in scentkit. There we go. We have successfully installed scentkit globally and we can now use it outside of this project. So now scentkit in it is going

to store the telegram bot token somewhere else. Scentkit telegram is going to send the message. So we have successfully published our CLI package and as you can seekit

binary is registered on this user's machine running node. Now let's go ahead and publish the last package which is local mcp. So inside of its package JSON right here, let's remove the private

flag. Let's go ahead and add a bin. So once again, this is going to be used by MCP agents in form of uh a binary executable. So we need to register the name which is sentit-m

and make it point to index.js within the dist folder. Make sure you register the dist folder under the files property. Now let's go ahead and add the usual main module and types all coming from

the disc. Now let's go ahead and modify our exports property to change the entry point to separately aim for the types and for the import. Then let's go ahead and add publish config access set to

public. And then let's go ahead and add our scripts here. So pack dry and pre-publish only. And let's make sure that in the pack dry we're actually using bun pm pack-ry

run. So this version right here sent kit core properly resolves. And now let's go ahead and register its script. So I'm going to go ahead inside of the package json here. We can duplicate this and

this will be called local MCP and it's going to call sendkit MCP. So perhaps the name of this can be MCP in that case. Actually, it might be better if this was called local MCP so that every

time we run this script, we are very explicit about what we are doing because this semantic right here, release pack and then the name of the package could very well later be for the remote MCP.

And since we already do dev local MCP build local MCP, let's also do release pack local MCP regardless of the fact that the name is Sendit MCP. So the reason the name here doesn't have local

inside is because it doesn't need to. Local and remote are simply aliases for us the developers to understand the differences between this folder right here and this folder right here. So

let's go ahead and do bun run release pack local mcp and then let's go inside of our packages local mcp and inside of here bun publish access public once again let's authorize and let's see this

package published and just like that we now have scentkit mcp in our organization under packages you can see again three dependencies one of them scentkit core meaning we once again

successfully resolved the published version of scentkit core package and we can now try installing sentit mcp once again even though it won't really be used like that uh the way it's going to

be used is within this mcp.json and open code.json. So perhaps I'd rather show you how to properly write this configuration, not by running the local development script, but instead by

running the published package. The only thing we have to change is the command right here. So instead of bun rundev local MCP, let's go ahead and use npx-y. And let's go ahead and point to our

newly published package. And for the cloud code configuration, change the command here to be npx and then go ahead and change the arguments here to be -y. And then once again your published

package. So those are the two configs we have the mcp the local mcp for cloud code and the local mcp for open code. Both of them are now using the published package. Let's try and test all of these

published packages to confirm that they are still working. So, I'm going to go ahead and do sentkit in it--telegram-bot-token. And then inside, I'm going to store my

token. Once I store my token, you can see the configuration here that it saved the config. Chances are this config already existed because it's the exact same one that we do during development.

Now I'm going to go ahead and do send kit telegram and I'm going to add the chat ID and the message hello from CLI deployed on npm. And let's check it out. Here it is. Hello from CLI deployed on

npm. So our published sendkit package officially works. And whoever downloads it and installs it on their machine can do these two steps and successfully send telegram messages to their bot. Now

let's go ahead and try open code and clot code. Make sure you are running them inside of your project because you still need the configuration for it. So it no longer depends on local MCP

package here but it still depends on the configuration which we wrote here. So if you truly want to test this outside of this project to confirm that it works, just open a new folder and add mcp.json

with this exact values inside or open code.json with this exact values inside. For simplicity sake, I'm just going to be in the same folder. So let's go ahead and do claude and let's go ahead and do

open code. So as you can see, it immediately recognized a new MCP server here because we updated it. So, I'm going to confirm that we can use that here. And it looks like we've hit a

problem. Right here, I can see it says one setup issue MCP. So, when I go into my MCPS, I can see that sentit has failed. And even if I try reconnecting, it still fails. And it also fails within

Open Code. Scenkit failed. So, what did we do wrong? And how do we debug this? The first thing that I did is actually went ahead and run the package which I wrote in the configuration. So this is

the one sent MCP and look at that it actually fails. It says command not found. What is the problem? Well, we forgot to do one thing. I forgot that this is an executable which means it

needs a shebang. So let's go ahead inside of our packages CLI source index and let's copy the shebang which we wrote up here and then let's go inside of local MCP source index and let's go

ahead and add it at the top. That was the problem. That is the issue. Let's confirm that instead of local MCP package JSON, we didn't forget the bin here. Sendit MCP. Great. So now that we

have the shebang, let's go ahead and publish this entire package again. Since we are publishing it again, we have to modify its version. So I'm going to bump this one to 0.1 instead of sendit MCP

package JSON. So make sure that you do the same. So I'm going to go ahead and do bun run release and this is pack and then this is local MCP. Let's go ahead and ensure that's correct. Then let's go

inside of our packages local MCP and let's go ahead and do bun publish access public. So once again let's authenticate and that will update the package. Once you publish an update you can see the

new version right here. So 0.0.1. Keep in mind that sometimes mpm doesn't really update the version right away. You can see that in here it still says it's on version zero. So don't worry if

that happens. uh try and go inside of your organization and chances are that you're going to see the updated version number right here. But even if it doesn't appear here, don't worry. Here's

what you can do right now. Simply go ahead and test the command again. So when we tried running this previously, it threw an error because of the missing shebang. But if we try it right now, it

appears to be hanging, which is exactly what we expect because this is intended to be consumed by agents and not by humans. So even after a successful test, it might still appear as if the MCP is

not working both in cloth code and in open code. I can see that there are no MCPS connected. I simply have to assume that this is due to stale cache. So go ahead and change from npx to bunx which

hasn't been cached. And let's go ahead and change that in both mcp.json and open code.json. So just change this to bun x which is essentially the equivalent on windows. It might be bun

and then x. So if bun x doesn't work for you on Windows, try doing this as a separate argument, right? But try this first. I'm not really sure because I don't use Windows, but I did have some

users reporting that BunX doesn't work for them out of the box. Either way, it should work with NPX. It's just that it's cached on my machine this way. So I have to do something to uh show that it

works. So once I try cloud now, there we go. Magically works all of a sudden. Send kit connected. And let's try open code. And hopefully there we go. One successfully connected uh MCP. So this

just shows we've successfully published this and we have fixed the issue by adding a shebang. It's just that MPX is still cached on my machine to use the wrong version. Let's go ahead and try it

out by sending a message. Use ScentKit MCP to send a telegram message. Provide it with a chat ID and the message hello from cloud code deployed local MCP. And let's go ahead and do the same in open

code. And now let's go ahead and give it the permission here because it needs it. Open code I think doesn't need permission. So we should now have two messages. And we do. Hello from open

code deployed local MCP and hello from cloud code deployed local MCP. So we have successfully verified that all of the packages we have published so far are properly working and usable to all

users who wish to install it on their machines. So we have successfully taken this project from local only to something anyone anywhere can use. Now it's time to create a GitHub repository

for this project so that we can actually deploy the remote MCP by simply connecting this GitHub repository to a service like railway, versel, etc. And let's make this repository public so

that we can finally create a skill file which can then be distributed by simply pointing to the location of the skill in this public repository. So, I'm going to

give this repository a name of SendKit. I'm going to choose the visibility to be public. And I'm just going to hit create repository. And since it already exists, we're going to use this option right

here and not this one. So, it already exists. So, first things first, we have to commit all of these changes here. So, let's go ahead and do get add get commit feature add npm publishing. And once

you've committed all of your changes, simply paste those three lines we just copied from GitHub down here. And what that's going to do is it's going to synchronize this local repository with

this GitHub repository right here. Now that we have the GitHub repository published and all three packages published on npm, the only thing left to do besides the skill is to deploy the

remote MCP application. There are a few things we have to modify in remote MCP package JSON before we can deploy it. Unfortunately, most cloud service providers do not recognize the monor

repo catalog version which we alias for using the workspace tag. Because of that, we have to specify the actual version that is published on npm. You can find that version by going inside of

your packages core package json. So for me, that's 0.0.0. So I'm going to go ahead and specify it right here. The second thing we have to do is add a start script which will very

simply be bun run source index.ds. This script is needed so that when you deploy it there is a start command which is recognized by the service and it's runnable. It will also purposely have

bun run at the beginning. So it recognizes the package manager that we are using. Let's quickly test it out by going inside of apps remote MCP and let's simply do bun run start. And you

should see the following message. Once you've done all of that, you can go back to the root and do a git commit. So I'm going to commit very simply here feature update remote MCP. And let's do a git

push. And now that the latest commit in our GitHub repository is this commit in which we've updated the remote MCP, we can safely deploy it. The remote MCP Hono server can be deployed anywhere

since the code we wrote is entirely provider agnostic. That being said, I'm going to be using Railway to deploy my application and you can do the same using the link on the screen which will

also give you access to $20 in Railway credits. Once you've created your account, go inside of your dashboard and create a brand new project. Choose the GitHub repository option and select

ScentKit. Because of the way we've structured our monor repo, Railway has recognized that ScentKit remote MCP is the only deployable application. So that is once again the reason why we've

separated it into apps folder and we haven't put it within the packages folder because the apps is a boundary. This is deployed. This has some kind of HTTP uh transport or protocol and

packages are something that are going to be either used internally or published on npm. So this isn't just semantics or opinionated folder structure. This is an industry standard so that most cloud

providers recognize your monor repo and intelligently extract the remote MCP deployment. Now let's go inside of the settings for this service and let's find a button to change or add a root

directory. You can do this on Railway, Versel, Netifi and most major providers. Just search for something similar to root directory and then in here you will most likely see autocompletes of

existing folders within your codebase and go ahead and choose apps remote mcp. So we want to build and start this application from this specific folder. We don't want to do it from the root

because that's just going to mess up all of the catalog workspace versions. So we are purposely isolating this deployment to appear as if it was a standalone application unrelated to this monor

repo. That's because we change the package json version here to an exact uh number semantic version and not use the catalog workspace tag. So if we were to deploy from the root that would cause

some problems with versions. So because of that you have to change the root directory here. That should be all you need to do before you deploy. Just make sure that this is preserved. So you can

close this. Click again in the settings and make sure you have this root directory. And then let's go ahead and click deploy. Once you have a successful deployment, you can generate a domain by

going inside of settings networking and click generate domain. And just like that, you will get your custom domain. If it asks you to enter a port, you can put 8080. And now that you have a static

and deployed remote NCP URL, you no longer have to use the temporary angro URL, you can disconnect that. You can even completely delete it from the list of applications that you have. Go ahead

and create a new app Sendkit production and then go ahead and use the new URL which we just deployed using HTTPS. So you can see this is my production URL on railway forward slashmy environment

token for telegram slmcp and set it to be no out. Let's go ahead and click create and let's see if it's going to successfully connect. And there we go. Looks like it all works meaning

we have successfully deployed the remote MCP. You can of course do the same thing onto claude.com. Just make sure to delete your existing uh scent kit connector because it only allows you to

have one custom connector. So let's go ahead and click add custom connector. Send kit production. I'm going to paste that URL with my Telegram environment key forward/mcp.

I'm not going to fill in allout client. And I'm just going to click add. And there we go. It recognized the tool Telegram, meaning once again it successfully read the MCP metadata and

information, meaning this is completely correctly deployed. At this point, some of you might be confused or your deployment is crashing because we didn't add clerk environment keys. And you

might be wondering, how come my app doesn't need clerk environment keys, but your app is crashing? And how come when I've connected the deployed remote MCP server to chatgpt.com

I selected the no out option even though we had a whole chapter about adding the OL authorization. The reason is very simple. Before I decided to record the chapter on how to add all out

authorization to our remote MCP server using a clerk. I have already finished the entire tutorial. So that lesson is an extra lesson I've decided to add to this tutorial. So because of that, I

didn't include it in the deployment steps. So that is what I'm going to do now. I'm going to show you some slight changes that you need to do. So your deployed remote MCP server also has

Clerk's O protection. So the only thing you actually have to do is add clerk publishable key and clerk secret key inside of the variables section inside of your railway service. So simply click

raw editor and go ahead and paste the environment keys here. That's all you need to do. And after that hit deploy. Once your app successfully redeploys, you're also going to have to connect to

chat GPT by selecting the OOTH authentication and of course using your railway deployment URL in here. Then inside of here, you're going to need to select userdefined OOT client. You're

going to copy the callback URL and you're going to paste it within your clerk's chat GPT or out. If you need a reminder, I would highly suggest going back to the chapter where I implement uh

all out for chat GPT and claude. And for claude, you actually don't need to do anything because claude can successfully create its own uh all out client. But chat GPT needs some help. So, it's a bit

more complicated. Nevertheless, once you add these environment keys, you will have uh wellknown endpoint which basically instructs clients to where to find Oout information. Once again, I

highly recommend just going back and rewatching my chapter uh in this tutorial on Oout uh configuration for the remote MCP server. Now that we have developed the CLI, the local MCP server

and the remote MCP server and everything is published and deployed, we are finally ready to create the skill. The first thing I recommend doing is adding the skill creator skill to your agents.

So, choose this one from Anthropic with almost 260,000 installs. Simply copy this snippet and go ahead and install it. Now, inside of our project, let's create a brand new

folder called skills. And inside of here, let's create a new folder called SendKit. This folder will be the name of the skill which is going to be displayed on a registry like skills.sh.

So, if you're wondering how does this exact name get generated, well, it reads the actual folder where the skill file is put in the GitHub repository. So if we want our name to be sendkit, you need

to create a folder sendkit and then inside skill.md file. Next, open clawed code within your project or any other coding agent which you use which also has the skill creator

skill enabled. And let's tell it to do the following. modified the skill.md within our skills folder sendkit folder to explain the following. Use sentit to send telegram messages from agents

through the sentit tool or CLI fallback. Use this when a user asks to send a telegram message. Use ScentKit, interact with the SendKit tool set or verify ScentKit manually or choose between

SendKit MCP and CLI workflows and then let's tell it at the end use skill creator skill. Good thing about running this command within this codebase is that it's actually going to gather

context about SendKit in the very codebase where it is developed. Meaning that it's going to have a deeper understanding of how ScentKit work. So, it's going to recognize what this

actually is. I'm going to go ahead and approve this changes. And then we're going to review the skill file to verify this is what we want. Let's review the output. So, skill.md in here. It uses

the standard format for the name and description, which is great. The name is SendKit, and the description seems fine. Send telegram messages from an agent through the SendKit MCP Telegram tool

with the SendKit CLI as a fallback. Use when the user asks to send a telegram message, mentions Sendit wants to interact with the Sendit tool set or asks to verify Sendit manually. Great.

So in here is a brief description. Now of course this might be different for you, but it should generally be similar to this. Scentkit sends Telegram messages. It exposes the same operation

two ways, both backed by our scent kit core. We have an MCP tool which is preferred for agents. You can of course change this rule. You can go ahead and instruct it, hey, make the CLI the

preferred tool and use the MCP as the fallback, right? It depends on what how you want your skill to be used, of course. So in here it will document both the MCP tool and the CLI which has to be

globally installed on the user's machine using the binary sendkit which in here is documented as the fallback if MCP is unavailable. But again you can change this if you don't like this behavior.

What you should care about right now is that the arguments are correct. So both MCP tool and the CLI take a chat ID and the message and then call the Telegram bot API. Choosing MCP versus CLI prefer

the MCP tool whenever the send kit MCP server is connected. It needs no shell and the bot token is supplied by the MCP client environment. So this is its reasoning why it prefers MCP over the

CLI tool. Depending on what your actual MCP uh and CLI tool is doing, you might choose to do it the other way around. But this is just one way of doing it for example. So when should it use the CLI?

When MCP server is not connected in this session. This is a great rule because we can immediately test if the skill works or not. What we're going to do in a moment is purposely turn off all of

these configuration files for MCP servers and we're going to see if the skill is then going to use the CLI to perform the same thing. So in here we have the MCP workflow. All of this looks

good. The bot token is read from Telegram bot token in the MCP server environment. CMCP JSON do not pass it. Okay. I think this is through. I think this is uh true. I just um I don't like

how it mentions this. Uh I mean I think it won't cause any problems, but okay. CLI workflow. Perfect. So it even documents how to add the Telegram bot token and where it's going to be stored.

Great. The arguments are correct. We have the output which we know how it's going to look and this is what I don't like. Run the CLI without installing the published package by using the workspace

dev script from the repository root. So this is one problem of running this command within the codebase because it can recognize that we have some dev tooling here. So I'm going to highlight

this exact scenario and I'm going to tell it consider that this skill will be distributed via a public registry. Do not add guides on local development scripts or usage from this codebase. Bad

example. And then I'm going to paste that. So I just want to clarify uh this codebase is a great way to to understand what send kit is and you've perfectly described how MCP and CLI works but

avoid using development only or maintainer only scripts. So I basically want to make sure that this skill is production ready so that uh users who don't have access to this repository can

run it. So since I've highlighted the exact problematic case I think it will now remove that. Beautiful. There we go. So run the CLI without a global install using bunx sendkit uh using my

organization scope or npx equivalent. Perfect. This is exactly how it's supposed to be used in production here. So, I was kind of thinking that this mcp.json might have also been sneaked in

here because it recognized that I have that file. But I think it's just uh thinking in general how this file will most likely exist if someone sets up the MCP configuration. So, I think we can

leave this as empty. So, feel free to take a look at my source code if yours doesn't look like this. and you just want to copy and paste it. But it doesn't need to be the same. You know,

all of these skills somewhat look like this. And once you have this skill, go ahead and commit it. So I'm going to go ahead and do git add g get commit feature add skill md. And let's go ahead

and do git push. Before we test our skill, if you are using cloud code, make sure to go inside of your connectors and remove scent kit in production entirely. The reason is that claude code will

actually use the connectors which you have added on the web here. And I would recommend doing the same thing in chatgpt.com. to completely delete these connectors so

that you can test codecs and cloud code without any chance of them using the remote MCPS which we have connected uh onto the HTTP clients to properly test whether our skill works or not and to

learn how to distribute it and add it. Let's make sure that we are not inside of scent kit or whatever is the name of your project. So go anywhere outside. Make sure that cloud code and open code

will not accidentally connect to any MCP servers because in this codebase we have the MCP JSON and open code JSON. So go somewhere where there is not going to be a single MCP server. So if I go ahead

and search for MCP, you can see that I have some Railway and React Grab which are my global MCP servers. But you shouldn't have any. And inside of open code, if I go here, I have no MCPS. So

whatever you see here, just make sure you don't see scent kit anywhere. So this is why we also had to turn it off on cloud.ai because it will use that remote MCP. So

let's just make sure that we are in a situation where we have absolutely no MCP servers. And now if I go ahead and tell it use Sendkit Telegram tool to send a telegram message or here use

Sendkit Telegram tool to send a telegram message. Let's see what is going to happen. As you can see it doesn't understand what Sendit is because we are no longer within the Sendit repository,

right? So it's being confused. It's asking us for clarification. What is this? Is this some kind of command? Is it some kind of API? You can see it is very confused. It doesn't know if this

should be an MCP server. What is it? This is the point of a skill file. So you can install it on your machine. it will be added into your coding agents and whenever wherever you find yourself

it's going to search for some MCP tools or it is going to fall back to scent kit and it's going to use this instead which as you can see is available even outside

of your uh codebase that is the point of this skill which we've just created. So, how do we add this skill to cloud code and open code? Distributing your skill is extremely easy thanks to skills.sh

registry. All you have to do is make it publicly available somewhere on GitHub and make sure that the skill.md is placed within a folder which is named exactly how you want this skill named.

So, go ahead and click on that folder here and copy the URL. And once you've done that, simply go ahead anywhere within your machine npx skills add and paste that URL. So this is my URL scent

kit tree main skills sent kit and let's press enter. As you can see that has successfully fetched the skill file. So it found the skill. In here you can see a brief description and then just follow

the normal installation. So, so just go ahead and select enter. I would suggest installing it globally so it is available everywhere and choose uh symbolic link so you don't have a bunch

of files. Instead, you only have one file and then let's proceed with the installation. Great. Let me go ahead and open open code once again this time. So, if I go inside of my skills and if I

search for scent kit, would you look at that? I now have a scent kit skill. Let's go ahead and do claude code once again. And there we go. I now have scent kit skill installed. So let's try this

again. Use scentkit telegram tool to send a message. I'm going to immediately provide the chat ID and I'm going to say a message hello from production ready skill. And let's see what's going to

happen. As you can see, it is using the sendkit skill. I didn't even have to tell it to explicitly use that skill because we have correctly described its behavior. And you can see that I didn't

even have to have this installed globally on my machine. It simply used bun x to uh run it one time. And since I did initialize it, I do have the config token stored on my machine. So, if I

didn't have that config, it would throw an error and tell me that I first need to run uh CWA-dev sendkit in it with the telegram token. But since we've already done that a few

times, you can see that it works. Let's take a look. Hello from production ready skill. Let's go ahead and try it in cloud code now. So use send kit tool to send a message chat ID and message hello

from claude code production ready skill and let's see if the same thing is going to happen. There we go. Successfully loaded the send kit uh skill. Now it's trying to send it using the MCP tool. So

let's see if it will recognize that it doesn't have it. There we go. So you can see the send kit MCP tool isn't connected. So I will use the CLI fallback and you can see that it's doing

the same thing. So I just have to confirm that I want to do this. And there we go. It is successful. Let's take a look. Hello from cloud code production ready skill. We have

successfully distributed our skill and we have installed it globally. So every single agent that we want to use SendKit in is now working whether or not we have

the MCP tool connected. Amazing. Amazing job. In this tutorial, you've learned how production ready MCP tooling and skills actually look like. We've developed this within a monor repository

so we can maintain all of our adapters and our deployed applications along with the actual scale file in one repository. You've learned how to distribute packages to npm and how to deploy

services to railway. Amazing amazing job. If you've liked this video, remember to leave a like, share, and subscribe. And leave a comment about what else you would like to see me make

a tutorial about. Thank you for watching and see you in the next
