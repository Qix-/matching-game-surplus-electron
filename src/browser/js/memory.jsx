import * as Surplus from 'surplus';
import S from 's-js';

import {grid} from './util/grid';
import {parallel} from './util/parallel';
import {shuffle} from './util/shuffle';

const elements = [];

const SIZE = 750;
const GRID_SIZE = 5;
const TILE_SIZE = SIZE / GRID_SIZE;
const TRANSITION = '0.3s ease-out';

async function getImage() {
	return new Promise((resolve, reject) => {
		const img = document.createElement('img');
		img.onload = () => resolve(img);
		img.onerror = e => reject(e);
		img.draggable = false;
		img.src = `https://picsum.photos/${TILE_SIZE}/${TILE_SIZE}/?random&nocachesry=${Math.random()}`
	});
}

function makeTile(img) {
	const flipped = S.value(false);

	const elem = (
		<div onClick={() => flipped(true)} style={{
			background: 'url(img/back.png)',
			backgroundPosition: `${Math.floor(Math.random() * 1000)}px ${Math.floor(Math.random() * 1000)}px`,
			transform: `perspective(600px) rotateY(${flipped() ? 0 : 180}deg)`,
			transition: `transform ${TRANSITION}`
		}}>
			<div style={{
				opacity: `${flipped() ? 1 : 0}`,
				transition: `opacity ${TRANSITION}`
			}}>
				{img}
			</div>
		</div>
	);

	return elem;
}

async function populateTiles() {
	elements.splice(0, Infinity); // Clear the array

	await parallel(GRID_SIZE * GRID_SIZE / 2, async i => {
		const img = await getImage();
		elements.push({
			value: i,
			elem: makeTile(img),
			revealed: false
		});

		const imgClone = img.cloneNode();
		elements.push({
			value: i,
			elem: makeTile(imgClone),
			revealed: false
		});
	});

	elements.forEach(e => {
		e.elem.memoryGameData = e;
	});

	shuffle(elements);
}

async function createGrid() {
	await populateTiles();

	const tiles = [];

	for (let y = 0; y < GRID_SIZE; y++) {
		for (let x = 0; x < GRID_SIZE; x++) {
			const tile = elements[y * GRID_SIZE + x];

			tiles.push((
				<div class="tile" style={grid.child(x + 1, y + 1)}>
					{tile.elem}
				</div>
			));
		}
	}

	return tiles;
}

const rootElem = () => {
	const elements = S.data([]);

	createGrid().then(elements);

	return (
		<div style={{
			...grid(`1fr ${SIZE}px 1fr`),
			width: '100vw',
			height: '100vh'
		}}>
			<div style={{
				...grid.child(2, 2),
				...grid.gap('0.25rem'),
				...grid(new Array(GRID_SIZE).fill('1fr'))
			}}>
				{elements()}
			</div>
		</div>
	);
};

export default function memoryGame(root) {
	S.root(() => {
		root.appendChild(rootElem());
	});
}
