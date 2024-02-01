import Bootstrap5Generator from "./src/Bootstrap5Generator";



const inst = new Bootstrap5Generator()

/*
function renderSass(props){
	return new Promise((resolve,reject)=>{
		sass.render(props,(err,result)=>{
			if(err){
				reject(err)
			}else{
				resolve(result)
			}
		})
	})
}
async function main(){
	const res = await renderSass({
		data:`
			$primary:#ff00ff;
			@import "bootstrap";
		`,
		includePaths:["./bootstrap/scss"]
	})
	fs.writeFileSync('test.css', res.css);

}

*/