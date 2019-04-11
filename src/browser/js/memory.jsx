import * as Surplus from 'surplus';
import S from 's-js';

import {grid} from './util/grid';
import {clearArray} from './util/clear-array';
import {parallel} from './util/parallel';
import {shuffle} from './util/shuffle';

const elements = [];
const firstFlipped = S.value(null);
const secondFlipped = S.value(null);
const frozen = S.value(false);
const matches = S.value(0);

const SIZE = 750;
const GRID_SIZE = 4;
const TILE_SIZE = SIZE / GRID_SIZE;
const TRANSITION = '0.3s ease-out';
const TOTAL_MATCHES = (GRID_SIZE * GRID_SIZE) / 2;

if ((GRID_SIZE * GRID_SIZE) % 2 !== 0) {
	alert('hey dumbass the grid size results in odd numbers');
}

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
		<div onClick={() => !frozen() && flipped(true)} style={{
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

	return {elem, flipped};
}

async function populateTiles() {
	clearArray(elements);

	await parallel(GRID_SIZE * GRID_SIZE / 2, async i => {
		const img = await getImage();
		const imgClone = img.cloneNode();

		elements.push(
			{
				value: i,
				...makeTile(img)
			}, {
				value: i,
				...makeTile(imgClone)
			}
		);
	});

	elements.forEach(e => {
		e.elem.memoryGameData = e;

		S.on(e.flipped, v => {
			if (!S.sample(e.flipped)) return;
			if (S.sample(firstFlipped)) {
				secondFlipped(e);
			} else {
				firstFlipped(e);
			}
		});
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

const rootElem = async () => {
	const elements = S.data([]);

	elements(await createGrid());

	S(() => {
		console.log(
			'first', firstFlipped() ? firstFlipped().value : 'none',
			'second', secondFlipped() ? secondFlipped().value : 'none');

		if (firstFlipped() && secondFlipped()) {
			const matched = firstFlipped().value === secondFlipped().value;

			frozen(!matched);

			if (matched) {
				firstFlipped(null);
				secondFlipped(null);
				matches(matches() + 1);
			} else {
				setTimeout(() => {
					firstFlipped().flipped(false);
					secondFlipped().flipped(false);
					firstFlipped(null);
					secondFlipped(null);
					frozen(false);
				}, 500);
			}
		}
	});

	S(() => {
		if (matches() === TOTAL_MATCHES) {
			setTimeout(async () => {
				alert('you win!');
				matches(0);
				firstFlipped(null);
				secondFlipped(null);
				frozen(false);
				elements(await createGrid());
			}, 500);
		}
	});

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
	S.root(async () => {
		root.appendChild(await rootElem());
	});
}
