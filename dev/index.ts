import fs from "node:fs";

const Bootstrap5Generator = require("../").Bootstrap5Generator



const  storage:any = {}

const cache = {
	setCachedCSS:(id:string,css:string)=>{
		storage[id] = css
	},
	getCachedCCS:(id:string)=>(storage[id])
}


const instance = new Bootstrap5Generator({cache})

async function main(){
	try{
		console.log("Generating")
		const css = await instance.getCSS({"$primary":"#ff0000","$secondary":"#00CCDD"})
		fs.writeFileSync('test.css', css);
		console.log("Generating")
		const css2 = await instance.getCSS({"$primary":"#ff0000","$secondary":"#00CCDD"})
		fs.writeFileSync('test2.css', css2);
	}
	catch (e) {
		console.error(e)
	}

}

main()