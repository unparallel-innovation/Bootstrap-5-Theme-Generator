import fs from "node:fs";

const Bootstrap5Generator = require("../").Bootstrap5Generator



const  storage:any = {}

const cache = {
	setCachedCSS:(id:string,css:string)=>{
		storage[id] = css
	},
	getCachedCSS:(id:string)=>(storage[id])
}

const variables = {
	"$primary": "#004968",
	"$secondary": "#ccdbe1",
	"$warning": "#ee8140",
	"$danger": "#CC3105",
	"$success": "#B6E186",
	"$body-bg": "#001e33",
	"$info": "#99b6c3",
	"$badge-pill-border-radius": "20rem",
	"$border-radius": "1.5rem",
	"$border-radius-lg": "1.5rem",
	"$border-radius-sm": "1.5rem",
	"$toast-border-radius": "2rem"
}

const instance = new Bootstrap5Generator({cache})

async function main(){
	try{
		console.log("Generating")
		console.time()
		const css = await instance.getCSS(variables)
		console.timeEnd()
		console.log("Generating")
		console.time()
		const css2 = await instance.getCSS(variables)
		console.timeEnd()
	}
	catch (e) {
		console.error(e)
	}

}

main()