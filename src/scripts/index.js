import * as echarts from 'echarts';
import { SVGRenderer } from 'echarts/renderers';
import { LINEA_COLOR, MVData } from './constants';
import '../styles/main.css';

// Eventos de document
document.addEventListener('DOMContentLoaded', chartMVHandler);

const dom = document.getElementById('graficaMV');

// ECharts
echarts.use([SVGRenderer]);
const myChart = echarts.init(dom, null, { renderer: 'svg' });
let option = {};

/**
 * Se obtienen los datos de forma remota de la url proporcionada
 * @param {URL} url Enlace para obtener datos desde otro sitio
 * @returns Respuesta o error de datos
 */
async function getData(url) {
	return await fetch(url)
		.then((resp) => resp.json())
		.catch((err) => {
			throw new Error(`No se han podido obtener los datos desde ${url}\n${err}`);
		});
}

/**
 * Función que se inicial una vez algún evento web se inicia y lo lanza
 */
async function chartMVHandler() {
	try {
		const { meses } = await getData(MVData).then((json) => json.doc);

		run(meses);
	} catch (err) {
		console.error(err);
	}
}

/**
 * Genera el gráfico de las línea de MetroValencia
 * @param {Array} _rawData Datos de cada línea de forma individual
 */
async function run(_rawData) {
	const lineas = Object.keys(LINEA_COLOR); // Se obtienen los títulos de los colores desde el objeto

	const datasetWithFilters = [];
	const seriesList = [];

	echarts.util.each(lineas, (linea) => {
		const datasetId = `dataset_${linea}`;
		datasetWithFilters.push({
			id: datasetId,
			fromDatasetId: 'dataset_raw',
			transform: {
				type: 'filter',
				config: {
					and: [{ dimension: 'Líneas', '=': linea }],
				},
			},
		});

		const color = LINEA_COLOR[linea];

		seriesList.push({
			type: 'line',
			datasetId,
			showSymbol: false,
			name: linea,
			endLabel: {
				show: true,
				formatter: function (params) {
					return params.value[2] + ': ' + params.value[1];
				},
			},
			color,
			labelLayout: {
				moveOverlap: 'shiftY',
			},
			emphasis: {
				focus: 'series',
			},
			encode: {
				x: 'Mes/Año',
				y: 'Pasajeros',
				label: ['Línea', 'Pasajeros'],
				itemName: 'Mes/Año',
				tooltip: ['Pasajeros'],
			},
		});
	});
	option = {
		animationDuration: 5_000,
		dataset: [
			{
				id: 'dataset_raw',
				source: _rawData,
			},
			...datasetWithFilters,
		],
		tooltip: {
			order: 'valueDesc',
			trigger: 'axis',
		},
		xAxis: {
			type: 'category',
			nameLocation: 'middle',
		},
		yAxis: {
			name: 'Pasajeros',
		},
		grid: {
			right: 100,
		},
		series: seriesList,
	};
	myChart.setOption(option);
}

if (option && typeof option === 'object') {
	myChart.setOption(option);
}
