const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
	// el punto de entrada de nuestra APP, JS que se ejecutara en el BROWSER
	entry: './src/scripts/index.js',
	output: {
		// el nombre que le daremos al archivo de salida principal
		filename: 'graficaMV.js',

		// donde se crearan los archivos de salida
		path: path.resolve(__dirname, 'dist'),
	},

	// configuracion para webpack-dev-server
	devServer: {
		// abrir la APP en el BROWSER
		open: true,

		// HACK para permitir ver la APP desde otros dispositivos
		host: '0.0.0.0',

		// ver el progreso de compilacion en la consola
		// progress: true,

		// esto para que todas las URLs que fallen (404) devuelvan nuestro index.html
		historyApiFallback: true,

		// para que los errores en consola aparescan en un overlay en el BROWSER
		// overlay: true,

		// habilitar HMR
		hot: true,
	},
	resolve: {
		alias: {
			img: path.resolve(__dirname, 'src/img'),
		},
	},
	module: {
		rules: [
			{
				// a que archivos afectara esta regla
				test: /\.js$/,

				// los loaders que apliquemos en la regla no afectaran
				// a archivos que coincidan con
				exclude: /(node_modules|bower_components)/,

				use: {
					// el nombre  del loader que usaremos
					loader: 'babel-loader',
					options: {
						// mejora la velocidad de compilacion
						// si en algun momento no se ven reflejados tus cambios
						// elimina la carpeta `node_modules/.cache`
						cacheDirectory: true,
					},
				},
			},
			{
				test: /\.(jpe?g|png|svg|gif)$/,
				type: 'asset',
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			// la ruta donde se encuentra nuestro index.html
			// para que HtmlWebpackPlugin lo use
			template: 'src/index.html',
		}),
	],
};

module.exports = (env, argv) => {
	if (argv.mode === 'development') {
		// nuestra regla para poder importar archivos CSS
		config.module.rules.push({
			test: /.css$/,

			// el primer loader en aplicarse es el ultimo, en este caso `css-loader`
			use: ['style-loader', 'css-loader'],
		});

		config.plugins.push(
			// con esto ya habilitamos HMR
			new webpack.HotModuleReplacementPlugin(),
		);
	}

	if (argv.mode === 'production') {
		// webpack reemplazara [name] con el nombre del archivo que importamos, ///
		// [contenthash:8] sera reemplazado por un hash de 8 digitos que cambia segun el contenido del archivo
		// aplicar long term caching a los archivos resultantes JS
		config.output.filename = 'static/js/bundle.[name].[contenthash:8].js';
		config.output.chunkFilename = 'static/js/chunk.[name].[contenthash:8].js';

		// nuestra regla para extraer los archivos CSSs en sus propios archivos
		config.module.rules.push({
			test: /\.css$/,
			use: [MiniCssExtractPlugin.loader, 'css-loader'],
		});

		config.plugins.push(
			new MiniCssExtractPlugin({
				// aplicar long term caching a los archivos resultantes CSS
				filename: 'static/css/bundle.[name].[contenthash:8].css',
				chunkFilename: 'static/css/chunk.[name].[contenthash:8].css',
			}),
		);
		config.optimization = {
			splitChunks: {
				chunks: 'all',
			},
		};
	}
	return config;
};
