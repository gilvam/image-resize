const maxImage = 3.6 * 1000000; // 3.6mb to bytes
let img = document.getElementById('image');
let imgResponse = document.getElementById('image-result');

const finishFile = (file) => {
	console.log(`tamanho final ${(file.size / 1000000).toFixed(2)}mb`);
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = (event) => {
		if (event.target.readyState === FileReader.DONE) {
			imgResponse.src = event.target.result;
		}
	};
};

const checkFileMaxSize = (file) => {
	if (file.size > maxImage) {
		console.log(`%c Compactar...`, 'background-color: #ffe7e7; color: #a40000; font-size: 12px; padding: 3;');
		compress(file, 0.9);
	} else {
		console.log(`%c Arquivo ok`, 'background-color: #5eba7d; color: #fff; font-size: 12px; padding: 3;');
		finishFile(file);
	}
}

;
const compress = (file, quality) => {
	const fileReader = new FileReader();

	fileReader.readAsDataURL(file);
	fileReader.onload = (event) => {
		img.src = event.target.result;
		const percentage = Math.floor((event.total * 100) / maxImage);
		console.log(
				`percentage: ${percentage}%`,
				' | tamano aceitável: ', `${(maxImage / 1000000).toFixed(2)}mb`,
				' | tamanho inicial: ', `${(event.total / 1000000).toFixed(2)}mb`
		);

		(img.onload = () => {
			const reducePercentage = 90; //porcentagem a ser usada no tamanho da imagem
			const width = Number(Math.round((img.naturalWidth * reducePercentage) / 100).toFixed(0)); // in 90%
			const height = Number(Math.round((img.naturalHeight * reducePercentage) / 100).toFixed(0)); // in 90%

			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			const optionsFile = {type: "image/jpeg", lastModified: Date.now()};
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, width, height);
			ctx.canvas.toBlob(blob => {
				const fileCompress = new File([blob], file.name, optionsFile);
				checkFileMaxSize(fileCompress);
			}, 'image/jpeg', quality);


		}), (fileReader.onerror = (error) => console.log(`error`, error));
	};
};

const onFileSelected = (event) => {
	const file = event.target.files[0];
	checkFileMaxSize(file);
}
