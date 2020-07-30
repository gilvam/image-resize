const max = {
	image: 3.6 * 1000000, // 3.6mb to bytes
	big: 1920, // lado maior
	small: 1080, // lado menor
};

let img = new Image();
let imgResponse = document.getElementById("image-result");

const addLog = (message) => {
	let li = document.createElement("li");
	li.innerText = message;
	document.getElementById("ul-log").appendChild(li);
};

/**
 * ultimo passo depois de diminuir o tamanho e/ou a dimensão da imagem
 * @param file
 */
const finishFile = (file) => {
	let reader = new FileReader();
	reader.readAsDataURL(file);

	reader.onloadend = async (event) => {
		if (event.target.readyState === FileReader.DONE) {
			imgResponse.src = event.target.result;
			await new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log(
						`tamanho final: ${(file.size / 1000000).toFixed(2)}mb | ${
							imgResponse.naturalWidth
						}px x ${imgResponse.naturalHeight}px`
					);
					addLog(
						`tamanho final: ${(file.size / 1000000).toFixed(2)}mb | ${
							imgResponse.naturalWidth
						}px x ${imgResponse.naturalHeight}px`
					);
				}, 500);
			});
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
	return { pxBig, pxSmall };
};

/**
 * retorna a porcentagem da imagem de acordo com a porcentagem da imagem anterior
 * @param px
 * @param percentage
 * @returns {number}
 */
const getPxPercentage = (px, percentage) => {
	return Math.round((px * 100) / percentage) + 1;
};

/**
 * Retorna o tamanho da imagem de acordo com o width e height mantendo a proporção correta
 * @param pxBig
 * @param pxSmall
 * @returns {{pxBig: number, pxSmall: number}}
 */
const getPxResize = (pxBig, pxSmall) => {
	const percentageBig = Math.round((pxBig * 100) / max.big) + 1;
	const percentageSmall = Math.round((pxSmall * 100) / max.small) + 1;

	if (percentageBig > percentageSmall) {
		// faz redução da imagem de acordo com a porcentagem maior
		pxBig = getPxPercentage(pxBig, percentageBig);
		pxSmall = getPxPercentage(pxSmall, percentageBig);
	} else {
		pxBig = getPxPercentage(pxBig, percentageSmall);
		pxSmall = getPxPercentage(pxSmall, percentageSmall);
	}

	return { pxBig, pxSmall };
};

/**
 * Verifica se o arquivo precisa ser redimencionado, compactado ou está no tamanho e dimensões aceitáveis
 * @param file
 * @returns {Promise<void>}
 */
const checkFileMaxSize = async (file) => {
	// const image = document.createElement('img');
	// let reader = new FileReader();
	// await reader.readAsDataURL(file);
	const image = new Image();
	const url = URL.createObjectURL(file);
	image.src = url;
	image.addEventListener("load", (event) => {
		URL.revokeObjectURL(url);

		setTimeout(() => {
			const { pxBig, pxSmall } = getBigAndSmallPx(
				image.naturalWidth,
				image.naturalHeight
			);

			if (pxBig > max.big || pxSmall > max.small) {
				console.log(
					`%c Diminuir tamanho da imagem...`,
					"background-color: #ffe7e7; color: #a40000; font-size: 12px; padding: 3;"
				);
				addLog(`Diminuir tamanho da imagem...`);
				const newPx = getPxResize(pxBig, pxSmall);
				compress(file, 100, newPx.pxBig, newPx.pxSmall);
			} else if (file.size > max.image) {
				console.log(
					`%c Compactar imagem...`,
					"background-color: #ffe7e7; color: #a40000; font-size: 12px; padding: 3;"
				);
				addLog(`Compactar imagem...`);
				compress(file, 0.9);
			} else {
				console.log(
					`%c Arquivo ok`,
					"background-color: #5eba7d; color: #fff; font-size: 12px; padding: 3;"
				);
				addLog(`Arquivo ok`);
				finishFile(file);
			}
		}, 500);
	});

	// return;
	// reader.onloadend = async (event) => {
	//   await new Promise((resolve, reject) => {
	//     image.src = event.target.result;
	//     console.log(`event.target.result`, event.target.result);
	//   });
	// };
};
/**
 * Diminuir o tamanho e/ou a dimensão da imagem original
 * @param file
 * @param quality
 * @param pxBig
 * @param pxSmall
 */
const compress = async (file, quality, pxBig = 0, pxSmall = 0) => {
	const fileReader = new FileReader();
	fileReader.readAsDataURL(file);

	const url = URL.createObjectURL(file);

	fileReader.onloadend = async (event) => {
		await new Promise((resolve, reject) => {
			img.src = url;

			const percentage = Math.round((event.total * 100) / max.image) + 1;

			img.addEventListener("load", (event) => {
				URL.revokeObjectURL(url);

				setTimeout(() => {
					let width, height;

					if (pxBig && pxSmall) {
						width = pxBig;
						height = pxSmall;
						const px = getBigAndSmallPx(img.naturalWidth, img.naturalHeight);
						console.log(
							`* IMAGEM | aceitável: ${max.big}px x ${max.small}px | inicial: ${px.pxBig}px x ${px.pxSmall}px`
						);
						addLog(
							`* IMAGEM | aceitável: ${max.big}px x ${max.small}px | inicial: ${px.pxBig}px x ${px.pxSmall}px`
						);
					} else {
						const reducePercentage = 95; //porcentagem a ser usada no tamanho da imagem
						width = Number(
							Math.round((img.naturalWidth * reducePercentage) / 100).toFixed(0)
						); // in 90%
						height = Number(
							Math.round((img.naturalHeight * reducePercentage) / 100).toFixed(
								0
							)
						); // in 90%

						console.log(
							`* ARQUIVO | porcentagem: ${percentage}% | tamanho aceitável: ${(
								max.image / 1000000
							).toFixed(2)}mb | tamanho inicial: ', ${(
								event.total / 1000000
							).toFixed(2)}mb`
						);
						addLog(
							`* ARQUIVO | porcentagem: ${percentage}% | tamanho aceitável: ${(
								max.image / 1000000
							).toFixed(2)}mb | tamanho inicial: ', ${(
								event.total / 1000000
							).toFixed(2)}mb`
						);
					}

					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;

					const optionsFile = { type: "image/jpeg", lastModified: Date.now() };
					const ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, width, height);
					ctx.canvas.toBlob(
						(blob) => {
							const fileCompress = new File([blob], file.name, optionsFile);
							checkFileMaxSize(fileCompress);
						},
						"image/jpeg",
						quality
					);
				}, 500);
			});
		});
	};
};

/**
 * Pega arquivo selecionado
 * @param event
 */
const onFileSelected = (event) => {
	const file = event.target.files[0];
	checkFileMaxSize(file);
};
