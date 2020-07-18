const max = {
	image: 3.6 * 1000000, // 3.6mb to bytes
	big: 1920, // lado maior
	small: 1080, // lado menor
}
let img = document.getElementById('image');
let imgResponse = document.getElementById('image-result');

/**
 * ultimo passo depois de diminuir o tamanho e/ou a dimensão da imagem
 * @param file
 */
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

/**
 * retorna o lado maior e menor da imagem
 * @param width
 * @param height
 * @returns {{pxBig: number, pxSmall: number}}
 */
const getBigAndSmallPx = (width, height) => {
	const pxBig = width >= height ? width : height;
	const pxSmall = width <= height ? width : height;
	return {pxBig, pxSmall};
}

/**
 * retorna a porcentagem da imagem de acordo com a porcentagem da imagem anterior
 * @param px
 * @param percentage
 * @returns {number}
 */
const getPxPercentage = (px, percentage) => {
	return Math.floor(px * 100 / percentage);
}

/**
 * Retorna o tamanho da imagem de acordo com o width e height mantendo a proporção correta
 * @param pxBig
 * @param pxSmall
 * @returns {{pxBig: number, pxSmall: number}}
 */
const getPxResize = (pxBig, pxSmall) => {
	const percentageBig = Math.floor((pxBig * 100) / max.big);
	const percentageSmall = Math.floor((pxSmall * 100) / max.small);

	if (percentageBig > percentageSmall) { // faz redução da imagem de acordo com a porcentagem maior
		pxBig = getPxPercentage(pxBig, percentageBig);
		pxSmall = getPxPercentage(pxSmall, percentageBig);
	} else {
		pxBig = getPxPercentage(pxBig, percentageSmall);
		pxSmall = getPxPercentage(pxSmall, percentageSmall);
	}

	return {pxBig, pxSmall}
}

/**
 * Verifica se o arquivo precisa ser redimencionado, compactado ou está no tamanho e dimensões aceitáveis
 * @param file
 * @returns {Promise<void>}
 */
const checkFileMaxSize = async (file) => {
		const image = document.createElement('img');
		let reader = new FileReader();
		await reader.readAsDataURL(file);

		reader.onloadend = async (event) => {
			await new Promise((resolve, reject) => {
				image.src = event.target.result;
				setTimeout(() => {
					const {pxBig, pxSmall} = getBigAndSmallPx(image.naturalWidth, image.naturalHeight);

					console.log(`pxBig > max.big || pxSmall > max.small`, pxBig > max.big || pxSmall > max.small,
						pxBig, '>', max.big, '||', pxSmall, '>', max.small
					);

					if (pxBig > max.big || pxSmall > max.small) {
						console.log(`%c Diminuir tamanho da imagem...`, 'background-color: #ffe7e7; color: #a40000; font-size: 12px; padding: 3;');
						const newPx = getPxResize(pxBig, pxSmall);
						// console.log(`getBigAndSmallPxResize(pxBig, pxSmall)`, newPx);

						compress(file, 100, newPx.pxBig, newPx.pxSmall);
					} else if (file.size > max.image) {
						console.log(`%c Compactar imagem...`, 'background-color: #ffe7e7; color: #a40000; font-size: 12px; padding: 3;');
						compress(file, 0.9);
					} else {
						console.log(`%c Arquivo ok`, 'background-color: #5eba7d; color: #fff; font-size: 12px; padding: 3;');
						finishFile(file);
					}

				}, 0);
			});
		};
	}
;

/**
 * Diminuir o tamanho e/ou a dimensão da imagem original
 * @param file
 * @param quality
 * @param pxBig
 * @param pxSmall
 */
const compress = (file, quality, pxBig = 0, pxSmall = 0) => {
	const fileReader = new FileReader();
	fileReader.readAsDataURL(file);
	fileReader.onload = (event) => {
		img.src = event.target.result;
		const percentage = Math.floor((event.total * 100) / max.image);

		(img.onload = () => {
			let width, height;

			if (pxBig && pxSmall) {
				width = pxBig;
				height = pxSmall;

				console.log(
					`* IMAGEM -`,
					' | aceitável: ', {pxBig: max.big, pxSmall: max.small},
					' | inicial: ', getBigAndSmallPx(img.naturalWidth, img.naturalHeight),
				);
			} else {
				width = img.naturalWidth;
				height = img.naturalHeight;

				console.log(
					`* ARQUIVO | percentage: ${percentage}%`,
					' | tamanho aceitável: ', `${(max.image / 1000000).toFixed(2)}mb`,
					' | tamanho inicial: ', `${(event.total / 1000000).toFixed(2)}mb`,
				)
			}

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

/**
 * Pega arquivo selecionado
 * @param event
 */
const onFileSelected = (event) => {
	const file = event.target.files[0];
	checkFileMaxSize(file);
}
