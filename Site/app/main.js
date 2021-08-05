window.Tab = class Tab {
	static globalPostfix = ' ~ НГСР';

	static switch(a) {
		let title = typeof a === 'string' ? a : a.srcElement.dataset.tabRef,
			globalTitle = $(`[data-tab="${ title }"]`).attr('data-tab-global-title');

		$(`[data-tab-ref="${ title }"], [data-tab="${ title }"]`).attr('current_', '').siblings().removeAttr('current_');
		if(globalTitle) {
			location.hash = title;
			document.title = globalTitle+this.globalPostfix;
			scrollTo(0, 0);
		}
	}

	static initialize() {
		let hash = location.hash.substring(1);

		$('[data-tab-ref]').each(function() {
			if($(this).siblings('[data-tab-ref="'+hash+'"]').length > 0) {
				return;
			}
			if($(this).attr('data-tab-ref') === hash || $(this).prevAll('[data-tab-ref]').length === 0) {
				Tab.switch($(this).attr('data-tab-ref'));
			}
		});
	}
}

window.Navigation = class Navigation {
	static toggle() {
		let preferences = JSON.parse(localStorage.getItem('preferences')) ?? {}

		if(!preferences.navigation) {
			preferences.navigation = {}
		}
		$('[_navigation]').attr('fixed_', (a, b) => {
			if(b === '') {
				preferences.navigation.fixed = undefined;

				return null;
			} else {
				preferences.navigation.fixed = true;

				return '';
			}
		});

		localStorage.setItem('preferences', JSON.stringify(preferences));
	}

	static initialize() {
		let preferences = JSON.parse(localStorage.getItem('preferences')) ?? {}

		if(preferences.navigation?.fixed) {
			$('[_navigation]').attr('fixed_',  '');
		}
	}
}

window.Dropdown = class Dropdown {
	static initialize() {
		$('[_dropdown]').attr('tabindex', 0).find('button').attr('tabindex', 0);
	}
}

window.Characters = class Characters {
	static grave = '\u0300';
	static acute = '\u0301';

	static replacePreservingCase(of, to) {
		let a = '';

		for(let i = 0; i < Math.max(of.length, to.length); i++) {
			let b = of[i] ?? of.slice(-1),
				c = to[i] ?? '';

			a += b === b.toUpperCase() && b !== b.toLowerCase() ? c.toUpperCase() : c;
		}

		return a;
	}

	static replaceAt(string, index, replacement) {
		return string.substring(0, index)+replacement+string.substring(index+replacement.length);
	}

	static insertAt(string, index, insertement) {
		return string.slice(0, index)+insertement+string.slice(index);
	}

	static applyCaptureGroups(string, ...cg) {
		for(let v of string.match(/\$(\d)/g) ?? []) {
			string = string.replaceAll(v, cg[v.substring(1)-1] ?? '');
		}

		return string;
	}

	static truncate(string, length) {
		return string.length > length ? string.slice(0, length-1)+'...' : string;
	}
}

window.Timestamp = class Timestamp {
	static current = () => Date.now();

	static toDateString(value) {
		let date = new Date(value*1);

		return date.toLocaleTimeString()+`, `+date.toLocaleDateString();
	}
}

window.File = class File {
	static write(content, type, title) {
		let d = new Blob([content], { type: type }),
			e = $('<a>').appendTo('body').attr({
				href: URL.createObjectURL(d),
				download: title
			});

		e[0].click();
		e.remove();
	}

	static read(element, function_, a) {
		let b = element.files[a ?? 0]

		if(b) {
			b.text().then(a => {
				b.text = a;
				function_(b);
			});
		}
	}
}

window.Translator = class Translator {
	// А Б В   Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У   Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я - Оригинал
	// А Б В Г Ґ Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ў Ф Х Ц Ч Ш   Ъ Ы Ь Э Ю Я - Добавленные, заменённые, убранные

	static rules = {
		beginning: { // В начале слова
			'ассо':		'асо',
			'взим':		'взым',
			'генном':	'геном',
			'дези':		'дезы',
			'елем':		'элем',
			'жвачк':	'жэвачк',
			'ие':		'е',
			'иис':		'ис',
			'капю':		'капи',
			'кт':		'хт',
			'мадем':	'мадм',
			'макул':	'мукул',
			'отим':		'отым',
			'отмщ':		'отомщ',
			'пассаж':	'пасаж',
			'рейти':	'рэйти',
			'ренде':	'рэндэ',
		//	'респу':	'репу',
			'скево':	'скео',
			'скрупу':	'скурпу',
			'тби':		'тыби',
			'тщ':		'ч',
			'чка':		'чека',
			'эйн':		'ин',
			'эсте':		'эстэ',

		//	'(б|т)?рен':				'$1рэн',
			'(в|п|кр)?ещ(?=е|ё)':		['$1ящ', 0],
			'г(?!..?г)':				'ґ',
		//	'(ис)?под(?=[кпстфхцчшщ])':	'$1пот',
			'че?ре[зс](?!л)':			'через'
		},
		everywhere: { // Везде
		//	'б(?=ь?[кпстфхцчшщ])':	'п',
			'в(?=ь?[кпстфхцчшщ])':	'ф',
		//	'г(?=ь?[кпстфхцчшщ])':	'х',	// [кч]
		//	'ґ(?=ь?[кпстфхцчшщ])':	'к',
		//	'д(?=ь?[кпстфхцчшщ])':	'т',
		//	'ж(?=ь?[кпстфхцчшщ])':	'ш',
		//	'з(?=ь?[кпстфхцчшщ])':	'с',
		//	'к(?=ь?[бгджз])':		'ґ',
		//	'п(?=ь?[бгджз])':		'б',
			'с(?=ь?[бгджз])':		'з',
		//	'т(?=ь?[бгджз])':		'д',
		//	'ф(?=ь?[бгджз])':		'в',
		//	'ш(?=ь?[бгджз])':		'ж',

			'агресс':			'агрэсс',
			'адеква':			'адэква',
			'адъюта':			'адьюта',
			'аккум':			'аккам',
			'альтер':			'альтэр',
			'анекс':			'анэкс',
			'астер(?=ис|о)':	'астэр',
			'афг':				'авг',

			'белорусси':	'белоруси',
			'бизнеc':		'бизнэс',
			'бленде':		'блэндэ',
			'бюллет':		'биллют',

			'вибрисс':	'вибрис',

			'гд':	'д',
			'гк':	'хк',
			'гч':	'хш',

			'ґаупт':	'ґэуб',
			'ґд':		'д',
			'ґенети':	'ґенэти',

			'дельт':			'дэльт',
			'детект':			'дэтэкт',
			'дефолт':			'дэфолт',
		//	'дж':				'ǯ',
		//	'дз':				'ӡ',
			'диспле':			'дисплэ',
			'дожд(?=[еёиьюя])':	'дощ',
			'дс(?=[клмнт])':	'ц',
			'дт':				'тт',
			'дфк':				'цк',
			'дц':				'цц',
			'дч':				'чч',
			'дщ':				'чщ',

			'жг':			'жж',
			'жд(?=[клмн])':	'ж',
			'же':			'жэ',
			'жё':			'жо',
			'жи':			'жы',
			'жч':			'щ',
			'жю':			'жу',
			'жя':			'жа',

			'зд(?=[клмн])':	'з',
			'зж':			'жж',
			'зс(?=[кт])':	'з',
			'зчч?':			'щ',
			'зш':			'шш',
			'зщ':			'щ',

			'идесяти':		'идясти',
			'из-под':		'с-под',
			'иил':			'ил',
			'индекс':		'индэкс',
			'инерт':		'инэрт',
			'интегр':		'интэгр',
			'интер(?!ес)':	'интэр',
			'искусст':		'искуст',

			'й(?=[еёюя])':	'',
			'йа':			'я',
			'йо':			'ё',
			'йу':			'ю',
			'й(?=[ъь])':	'й',

			'картел':			'картэл',
			'кластер':			'кластэр',
			'команданте':		'командантэ',
			'конте(?=йн|нт)':	'контэ',
			'копилефт':			'копилэфт',
			'копирайте':		'копирайтэ',
			'кортеж':			'кортэж',

			'лн(?=еч|ц|ыш)':	'н',
			'ль(?=зя|ко(?!в))':	'',

			'маньч':		'манч',
			'менедж':		'мэнэдж',
			'менеджме':		'мэнэджмэ',
			'мистер':		'мистэр',
			'моде(?=л|р)':	'модэ',

			'н(?=[чщ]ь)':	'нь',
			'нд(?=[зсщ])':	'н',
			'нт(?=[сщ])':	'н',
			'нх(?=[кш])':	'н',

			'оппо':	'опо',

			'пандеми':			'пандэми',
			'панел(?=и|ь)':		'панэл',
			'парикм':			'парихм',
			'потен(?=[зтц])':	'потэн',
			'пржэва':			'прожэва',
			'прогресс':			'прогрэсс',
			'проек(?=[тц])':	'проэк',

			'радиоакти':		'радиакти',
			'ранде(?=[внр])':	'рандэ',
			'росси':			'роси',

			'сарде':			'сардэ',
			'сейч':				'сеч',
			'секс':				'сэкс',
			'сервис':			'сэрвис',
			'скутер':			'скутэр',
		//	'сс(?=[иклмнт])':	'с',
			'ст(?=[гклмн])':	'с',
			'стс':				'сц',
			'стч':				'щ',
			'сч':				'щ',
			'сш':				'шш',
			'сщ':				'щ',
			'сяч':				'щ',

			'тд':				'дд',
			'теи(?=[знс])':		'тэи',
			'тенде(?=нц|р)':	'тэндэ',
			'терабайт':			'тэрабайт',
			'термос':			'тэрмос',
			'терра(?=р|ф)':		'тэрра',
			'терро':			'тэрро',
			'тзб':				'цб',
			'т(о|у)ннел':		'т$1нэл',
			'торрент':			'торрэнт',
		//	'требуш':			'трибуш',
			'тремпел':			'трэмпел',
			'треугол':			'триугол',
			'тс(?=[клмнт])':	'ц',
			'тся':				'цца',
			'тц':				'цц',
			'тч':				'чч',
			'тщ':				'чщ',
			'ться':				'цца',
			'тэрнет':			'тэрнэт',

			'учр':	'учер',

			'ф(?=[аеёиоуыэюя]|ь[еёиоюя])':	['хв', 1],
			'фейспалм':						'фэйспалм',
			'флюоро':						'флюро',
			'фрикаде':						'фрикадэ',
			'фств':							'ств',

			'хг':	'г',
			'хейт':	'хэйт',

			'це':	'цэ',
			'цё':	'цо',
			'ци':	'цы',
			'цю':	'цу',
			'ця':	'цца',

			'ча':			'чя',
		//	'чески':		'чны',
			'ч(?=ж|ш)':		['д', 2],
			'что(?![вл])':	'што',
			'чо':			'чё',
			'чу':			'чю',
			'чэ':			'че',
			'чють-чють':	'чючють',

			'ше':				'шэ',
			'шё':				'шо',
			'ши':				'шы',
			'шоколад':			'шэколад',
			'шт(?=[клмнш])':	'ш',
			'ште(?=йн|пс)':		'штэ',
			'што':				['шо', 3],
			'шч':				'щ',
			'шш(?=т|э)':		'ш',
			'шэдевр':			'шэдэвр',
			'шю':				'шу',
			'шя':				'ша',

			'ща':	'щя',
			'що':	'щё',
			'щри':	'щери',
			'щу':	'щю',
			'щэ':	'ще',

		//	'ьи':	'ьйи',
			'ьо':	'ьё',

			'экзе':		'экзэ',
			'экспрес':	'экспрэс',
			'энерг':	'энэрг',

			'ять?с':	'яц',

			'([бклмрф])\\1':													'$1',
			'([бвп])ь(?=[еёиюя])':												'$1ъ',
			'в(?=ь?[ \\t\\p{P}]+[кпстфхцчшщ])':									'ф',
			'(?<=^|[\\s\\d\\p{P}]+)[вф](?=[ \\t\\p{P}]+[^аеёиоуыэюя])':			['ў', 4],
			'(?<=^|[\\s\\d\\p{P}]+|[аеёиоуыэюя])[влф](?![аеёиоуъыьэюя])':		['ў', 4],
			'вот[- \\t]+так':													'о-так',
			'(г|ґ)енез':														'$1енэз',
			'[дт]ь?(?=(д|т)[еёиьюя])':											'$1',
		//	'(?<=\\S{4,})евае':													'иё',
			'(?<=\\S{5,})еви(ч|ш)':												['и$1', 5],
			'(?<=\\S{5,})(?:[ди]р)?ови(ч|ш)':									['ы$1', 5],
			'(?<!пер)его(?!дя|м|р)':											'ево',
			'(?<=^|[\\s\\d\\p{P}])(а|у)?ж(?=[ \\t\\p{P}]+[кпстфхцчшщ])':		'$1ш',
			'([жцчшщ])ь(?=[^еёиюя]|$)':											'$1',
			'([жцш])ь(?=[еёиюя])':												'$1ъ',
		//	'(з|с)(?=[днст][еёиьюя])':											['$1ь', *],
			'(?<=[бвгджз][ \\t]+)и':											['ы', 6],
			'(?<=[^аеёийоучщыьэюя\\p{P}][ \\t]+)(е(?=во|ё)|и)':					['ы', 6],
		//	'(?<=[чщь][ \\t]+)е(?=ё)':											['и', 6],
			'(?<=\\S{4,}[^бвгдкх])ива([еёйюя]\\S*)':							['ю$1', 7],
			'(?<=\\S{4,})(?<!б|[дзк]р|[пс]л)[иы]ва([еёйюя]\\S*)':				['у$1', 7],
			'(?<=\\S([взлнптф]|(?<!п)р))ир(?=[оу](?!с))':						'',
			'(?<!ка)пле(?=е|й)':												'плэ',
			'(?<!пе)рейд':														'рэйд',
			'(ф|хв)анер':														'$1анэр',
			'(ф|хв)ицыр':														'$1ик',
			'(ф|хв)онет':														'$1онэт',
			'т(?=[еёиюья])':													['ц', 8],
			'щ(?=[еёищюя])':													'ш',
			'щь?':																'шь',
			'((?<=м)|с?т)ьдесят':												'сят',
			'((?<=м)|с?т)ьсот':													'сот'
		},
		ending: { // В конце слова
		//	'в':	'ф',
		//	'г':	'х',
			'ее':	['ей', 9],
			'име':	'имэ',
			'стр':	'стор',
		//	'сь':	'ся',
			'эго':	'эво',

			'[дт]с((?:ам|ов)?[аиуы]?)':						'ц$1',
			'цца':											['тса', 10],
			'ц((?:ам|ов)?[аиуы]?)':							['тс$1', 10],
			'(?<!а)кто':									'хто',
		//	'(?<=и)нет':									'нэт',
			'ни([еёюя][вм]?)':								['нь$1', 11],
			'ни(и[вм]?)':									['ньи', 11],
			'(л|ў)ся':										['$1са', 10],
			'(?<!дор|л|(?<![уў])мн|(?<!бы|о)стр)ого(-.*)?':	'ово$1',
			'ые':											['ыэ', 12],
		//	'(?<!л)ь(ся|те)':								'$1',
			'([^еёиюя])\\1':								'$1'
		}
	}
	static parts = ((a) => { for(let k in a) { a[k] = a[k].sort((a, b) => a.length > b.length ? -1 : a.length < b.length ? 1 : 0); } return a; })({
		prefixes: ['а', 'ана', 'анти', 'архи', 'без', 'бес', 'в', 'вз', 'во', 'воз', 'возо', 'вос', 'вс', 'вы', 'гипер', 'гипо', 'де', 'дез', 'дис', 'до', 'за', 'зкстра', 'из', 'изо', 'ин', 'интер', 'инфра', 'ис', 'квази', 'кило', 'контр', 'макро', 'мата', 'мега', 'микро', 'мульти', 'на', 'над', 'надо', 'наи', 'не', 'недо', 'низ', 'низо', 'нис', 'о', 'об', 'обез', 'обес', 'обо', 'орто', 'от', 'ото', 'па', 'пан', 'пара', 'пере', 'по', 'под', 'подо', 'пол', 'полу', 'пост', 'пра', 'пре', 'пред', 'предо', 'при', 'про', 'прото', 'раз', 'разо', 'рас', 'ре', 'с', 'со', 'су', 'суб', 'супер', 'транс', 'ультра', 'через', 'черес', 'чрез', 'экс'],
		suffixes: ['а', 'ащ', 'в', 'вш', 'вши', 'е', 'ев', 'ева', 'еват', 'ек', 'ем', 'ен', 'енн', 'енок', 'еньк', 'ечк', 'и', 'ив', 'ива', 'ик', 'им', 'ист', 'ичк', 'к', 'л', 'лив', 'н', 'ник', 'ниц', 'нн', 'о', 'ов', 'ова', 'оват', 'овит', 'ок', 'ом', 'онк', 'онок ', 'оньк', 'очк', 'ск', 'т', 'тель', 'ти', 'ть', 'у', 'ушк', 'ущ', 'чив', 'чик', 'чь', 'ш', 'ши', 'щик', 'ыва', 'ышк', 'юшк', 'ющ', 'я', 'ящ', 'ёк'],
		endings: ['а', 'ам', 'ами', 'ат', 'ать', 'ах', 'ая', 'е', 'его', 'ее', 'ей', 'ем', 'ему', 'ет', 'ете', 'ешь', 'ём', 'ёму', 'ёт', 'ёте', 'ёшь', 'и', 'ие', 'ий', 'им', 'ими', 'ит', 'ите', 'ить', 'их', 'ишь', 'й', 'о', 'ов', 'ого', 'ое', 'ой', 'ом', 'ому', 'у', 'ут', 'ую', 'ы', 'ые', 'ый', 'ым', 'ыми', 'ых', 'ю', 'ют', 'юю', 'я', 'ям', 'ями', 'ят', 'ях', 'яя'],
		postfixes: ['-ка', '-либо', '-нибудь', '-таки', '-то', 'сь', 'ся', 'те']
	});

	static preferences = {}

	static ref = (title) => `[data-translator-ref="${ title }"]`;

	static in = () => document.querySelector(this.ref('in'));
	static out = () => document.querySelector(this.ref('out'));

	static parse(raw) {
		let alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
			word = `([${ alphabet+Characters.grave+Characters.acute }-])+`,
			symbol = `([^${ alphabet+Characters.grave+Characters.acute }-])+`,
			parsed = this.in().value.match(new RegExp(word+'|'+symbol, 'gi')) ?? []

		for(let k in parsed) {
			let string = parsed[k],
				start = typeof parsed[k-1] === 'object' ? parsed[k-1].end+1 : 0;

			parsed[k] = {
				start: start,
				end: start+string.length-1,
				type: new RegExp(word, 'gi').test(string) ? 'word' : 'symbol',
				string: string
			}
		}
		for(let v of parsed) {
			if(v.type !== 'word') {
				continue;
			}

			// Разбор гласных

			let vowelIndex = -1;

			v.vowelsCount = 0;

			for(let i = 0; i < v.string.length; i++) {
				if(!/[аеёиоуыэюя]/i.test(v.string[i])) {
					continue;
				}

				vowelIndex++;
				v.vowelsCount++;
				if(v.string[i+1] === Characters.grave) {
					v.graveIndex = vowelIndex;
				}
				if(v.string[i+1] === Characters.acute) {
					v.acuteIndex = vowelIndex;
				}
			}

			v.string = v.string.replaceAll(Characters.grave, '').replaceAll(Characters.acute, '');
		}

		return parsed;
	}

	static unparse(parsed, considerAccents) {
		let raw = '';

		for(let v of parsed) {
			if(considerAccents) {
				// Сбор гласных

				let vowelIndex = -1;

				for(let i = 0; i < v.string.length; i++) {
					if(!/[аеёиоуыэюя]/i.test(v.string[i])) {
						continue;
					}

					vowelIndex++;
					if([v.graveIndex, v.acuteIndex].includes(vowelIndex)) {
						v.string = Characters.insertAt(v.string, i+1, v.graveIndex !== vowelIndex ? Characters.acute : Characters.grave);
					}
				}
			}

			raw += v.string;
		}

		return raw;
	}

	static go() {
		let a = this.in().value,
			b = this.out(),
			c = this.rules.beginning,
			d = this.rules.everywhere,
			e = this.rules.ending;

		$(this.ref('in')+', '+this.ref('out'))[a.length <= 128 ? 'attr' : 'removeAttr']('zoom_', '');
		$(this.ref('clear'))[a.length > 0 ? 'attr': 'removeAttr']('onclick', 'Translator.clear();');

		let parsed = this.parse(a),
			ruleEnabled = (a, returnReplacement) => {
				let b = !Array.isArray(a),
					c = this.preferences[a[1]]

				return !returnReplacement ? b ? true : c : b ? a : a[0]
			}

		for(let k in parsed) {
			let v = parsed[k]

			if(v.type !== 'word') {
				continue;
			}

			// Применение общих правил замены

			k = k*1;

			let leftmost = parsed[k-2]?.string ?? '',
				left = parsed[k-1]?.string ?? '',
				right = parsed[k+1]?.string ?? '',
				rightmost = parsed[k+2]?.string ?? '',
				position = leftmost.length+left.length,
				length = v.string.length,
				synchronizeLengths = (s, r, p) => {
					let d = s.length-r.length;

					if(p >= position && p < position+length) {
						length -= d;
					}
					if(p < position) {
						position -= d;
					}

					return r;
				}

			v.string = leftmost+left+v.string+right+rightmost;

			for(let k in c) v.string = ruleEnabled(c[k]) ? v.string.replace(new RegExp('(?<=^|[\\s\\d\\p{P}])'+k+'(?=\\S)',	'giu'), (sr, ...cg) => synchronizeLengths(sr, Characters.replacePreservingCase(sr, Characters.applyCaptureGroups(ruleEnabled(c[k], true), ...cg)), cg[cg.length-2])) : v.string;
			for(let k in d) v.string = ruleEnabled(d[k]) ? v.string.replace(new RegExp(k,									'giu'), (sr, ...cg) => synchronizeLengths(sr, Characters.replacePreservingCase(sr, Characters.applyCaptureGroups(ruleEnabled(d[k], true), ...cg)), cg[cg.length-2])) : v.string;
			for(let k in e) v.string = ruleEnabled(e[k]) ? v.string.replace(new RegExp('(?<=\\S)'+k+'(?=$|[\\s\\d\\p{P}])',	'giu'), (sr, ...cg) => synchronizeLengths(sr, Characters.replacePreservingCase(sr, Characters.applyCaptureGroups(ruleEnabled(e[k], true), ...cg)), cg[cg.length-2])) : v.string;

			v.string = v.string.substring(position, position+length);

			// Замена безударного "О" на "А"

			if(this.preferences[-1] && v.vowelsCount > 0) {
				let vowelIndex = -1;

				for(let i = 0; i < v.string.length; i++) {
					if(!/[аеёиоуыэюя]/i.test(v.string[i])) {
						continue;
					}

					vowelIndex++;
					if(vowelIndex !== v.graveIndex && vowelIndex !== v.acuteIndex && /о/i.test(v.string[i])) {
						v.string = Characters.replaceAt(v.string, i, Characters.replacePreservingCase(v.string[i], 'а'));
					}
				}
			}

			// Замена дублирующихся букв на апострофы

			for(let i = v.string.length-1; i > -1; i--) {
				if(v.string[i] === '-') {
					continue;
				}
				if(v.string[i] === v.string[i-1]) {
					v.string = Characters.replaceAt(v.string, i, `'`);
				}
			}
		}

		b.value = this.unparse(parsed);
	}

	static loadPreferences(initialisation) {
		let preferences = JSON.parse(localStorage.getItem('preferences')) ?? {}

		this.preferences = {}

		if(!preferences.translator) {
			this.savePreferences();
		}
		for(let k in preferences.translator) {
			this.preferences[k] = preferences.translator[k]

			if(initialisation) {
				document.querySelector('[data-translator-preference="'+k+'"]').checked = preferences.translator[k]
			}
		}

		this.go();
	}

	static savePreferences(event) {
		let preferences = JSON.parse(localStorage.getItem('preferences')) ?? {},
			inDOMPreferences = !event ? document.querySelectorAll('[data-translator-preference]') : [event.srcElement]

		if(!event || !preferences.translator) {
			preferences.translator = {}
		}
		for(let v of inDOMPreferences) {
			let k = v.dataset.translatorPreference;

			if(k) {
				preferences.translator[k] = v.checked;
			}
		}

		localStorage.setItem('preferences', JSON.stringify(preferences));
		this.loadPreferences();
	}

	static loadAccents() {
		let a = this.in(),
			accents = JSON.parse(localStorage.getItem('accents')) ?? {},
			parsed = this.parse(a.value),
			apply = (a, b, c = 0) => {
				if(b in accents) {
					if(accents[b].graveIndex != undefined) {
						a.graveIndex = accents[b].graveIndex+c;
					}
					if(accents[b].acuteIndex != undefined) {
						a.acuteIndex = accents[b].acuteIndex+c;
					}

					return true;
				}
			}

		for(let v of parsed) {
			let k = v.string.toLowerCase();

			if(v.type !== 'word' || v.graveIndex != undefined || v.acuteIndex != undefined || apply(v, k)) {
				continue;
			}

			let parts = {
					prefix: '',
					root: '',
					suffix: '',
					ending: '',
					postfix: ''
				},
				offset;

			for(let v of this.parts.prefixes) {
				if(k.startsWith(v) && k.length > v.length) {
					parts.prefix = v;

					break;
				}
			}
			for(let v of this.parts.postfixes) {
				if(k.endsWith(v) && k.length > v.length) {
					parts.postfix = v;

					break;
				}
			}
			for(let v of this.parts.endings) {
				if(k.endsWith(v+parts.postfix) && k.length-parts.postfix.length > v.length) {
					parts.ending = v;

					break;
				}
			}
			for(let v of this.parts.suffixes) {
				if(k.endsWith(v+parts.ending+parts.postfix) && k.length-parts.ending.length-parts.postfix.length > v.length) {
					parts.suffix = v;

					break;
				}
			}

			parts.root = k.replace(new RegExp('^'+parts.prefix+'|'+parts.suffix+parts.ending+parts.postfix+'$', 'gi'), '');
			offset = parts.prefix.match(/[аеёиоуыэюя]/gi)?.length;

			if(apply(v, parts.root+parts.suffix+parts.ending+parts.postfix, offset))	continue;
			if(apply(v, parts.root+parts.suffix+parts.ending, offset))					continue;
			if(apply(v, parts.root+parts.suffix, offset))								continue;
			if(apply(v, parts.root, offset))											continue;
			if(apply(v, parts.prefix+parts.root+parts.suffix+parts.ending))				continue;
			if(apply(v, parts.prefix+parts.root+parts.suffix))							continue;
			if(apply(v, parts.prefix+parts.root))										continue;
		}

		a.value = this.unparse(parsed, true);
		a.oninput();
	}

	static saveAccents(selected) {
		let a = this.in(),
			accents = JSON.parse(localStorage.getItem('accents')) ?? {}

		for(let v of this.parse(a.value)) {
			let k = v.string.toLowerCase();

			if(v.type !== 'word' || selected && (a.selectionStart === a.selectionEnd ? a.selectionStart < v.start || a.selectionEnd-1 > v.end : a.selectionStart > v.start || a.selectionEnd-1 < v.end)) {
				continue;
			}
			if(v.graveIndex == undefined && v.acuteIndex == undefined) {
				delete accents[k]
				continue;
			}

			accents[k] = {
				graveIndex: v.graveIndex,
				acuteIndex: v.acuteIndex
			}
		}

		localStorage.setItem('accents', JSON.stringify(accents));
		this.updateAccentsTable();
	}

	static displayAccents() {
		let a = this.in(),
			accents = JSON.parse(localStorage.getItem('accents')) ?? {},
			accents_ = []

		if(a.value.trim() !== '' && !confirm(`Отобразить базу ударений вместо текущего текста?`)) {
			return;
		}

		for(let k in accents) {
			accents_.push({
				string: k,
				graveIndex: accents[k].graveIndex,
				acuteIndex: accents[k].acuteIndex
			});
		}

		accents_.sort((a, b) => a.string > b.string ? 1 : a.string < b.string ? -1 : 0);

		for(let k = accents_.length-1; k > 0; k--) {	// Переносы строк между словами
			accents_.splice(k, 0, { string: '\n' });
		}

		a.value = Translator.unparse(accents_, true);
		a.oninput();
		this.updateSaveButtons();
		Tab.switch('translate');
		scrollTo(0, 0);
	}

	static scrolled(element) {
		let a = this.in(),
			b = this.out(),
			c = $(this.ref(element.dataset.translatorRef)+':hover').length > 0;	// element.matches(':hover');

		if(c) {
			if(element === a) {
				b.scrollTop = a.scrollTop;
			}
			if(element === b) {
				a.scrollTop = b.scrollTop;
			}
		}
	}

	static insertAccent(grave) {
		// TODO Добавить проверку на дубли знаков ударения во всём слове, используя парсер и его маркеры положения токенов

		let a = this.in(),
			b = a.value,
			c = a.selectionEnd-a.selectionStart === 1 ? a.selectionEnd : a.selectionStart;

		if(/[аеёиоуыэюя]/i.test(b[c-1]) && ![Characters.grave, Characters.acute].includes(b[c])) {
			a.value = Characters.insertAt(b, c, !grave ? Characters.acute : Characters.grave);
		}

		a.focus({ preventScroll: true });
		a.setSelectionRange(c, c);
		a.oninput();
	}

	static updateSavesTable() {
		let a = $(this.ref('savesTable')),
			b = $(this.ref('downloadSaves')),
			saves = JSON.parse(localStorage.getItem('saves')) ?? {},
			saves_ = []

		a.html('');
		for(let k in saves) {
			saves_.push({
				timestamp: k,
				string: saves[k]
			});
		}
		saves_.sort((a, b) => a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0);
		for(let v of saves_) {
			a.append(`
				<div>
					<div wide_>${ Characters.truncate(v.string, 128) }</div>
					<div wrapless_>${ Timestamp.toDateString(v.timestamp) }</div>
					<div>
						<div _flex="h">
							<button onclick="Translator.load('${ v.timestamp }')">Загрузить</button>
							<button onclick="Translator.delete('${ v.timestamp }')">Удалить</button>
						</div>
					</div>
				</div>
			`);
		}
		if(saves_.length > 0) {
			a.prepend(`
				<div __header>
					<div wide_>Краткое содержание</div>
					<div wrapless_>Дата создания</div>
					<div>
						<!--
						<div _flex="h">
							<button>◀</button>
							<button>▶</button>
						</div>
						-->
					</div>
				</div>
			`);
			b.attr('onclick', 'Translator.download(\'saves\');');
		} else {
			a.append('<div><div>Пусто.</div></div>');
			b.removeAttr('onclick');
		}
	}

	static updateAccentsTable() {
		let a = $(this.ref('accentsTable')),
			b = $(this.ref('downloadAccents')),
			c = $(this.ref('displayAccents')),
			accents = JSON.parse(localStorage.getItem('accents')) ?? {},
			accents_ = []

		a.html('');
		for(let k in accents) {
			accents_.push({
				string: k,
				...accents[k]
			});
		}
		accents_.sort((a, b) => a.string > b.string ? 1 : a.string < b.string ? -1 : 0);
		for(let v of accents_) {
			a.append(`
				<div>
					<div wrapless_>${ v.graveIndex != undefined ? v.graveIndex+1 : '' }</div>
					<div wrapless_>${ v.acuteIndex != undefined ? v.acuteIndex+1 : '' }</div>
					<div wide_>${ v.string }</div>
				</div>
			`);
		}
		if(accents_.length > 0) {
			a.prepend(`
				<div __header>
					<div wrapless_>Позиция левого ударения</div>
					<div wrapless_>Позиция правого ударения</div>
					<div wide_></div>
				</div>
			`);
			b.attr('onclick', 'Translator.download(\'accents\');');
			c.attr('onclick', 'Translator.displayAccents();');
		} else {
			a.append('<div><div>Пусто.</div></div>');
			b.removeAttr('onclick');
			c.removeAttr('onclick');
		}
	}

	static updateSaveButtons(timestamp) {
		let a = $(this.ref('date')),
			b = $(this.ref('closeCurrent')),
			c = $(this.ref('saveCurrent')),
			d = $(this.ref('restoreCurrent')),
			e = $(this.ref('deleteCurrent')),
			f = ['close', 'save', 'load', 'delete']

		if(timestamp) {
			a.text(Timestamp.toDateString(timestamp));
			[b, c, d, e].forEach(v => v.attr('onclick', 'Translator.'+f.shift()+'('+timestamp+');'));
		} else {
			a.text('');
			[b, c, d, e].forEach(v => v.removeAttr('onclick'));
		}
	}

	static clear() {
		let a = this.in();

		if(a.value.trim() !== '' && !confirm(`Очистить поле ввода?`)) {
			return;
		}

		a.value = '';
		a.oninput();
	}

	static close(timestamp) {
		let a = this.in(),
			saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(saves[timestamp] !== a.value && !confirm(`Закрыть сохранение "${ Timestamp.toDateString(timestamp) }"?`)) {
			return;
		}

		a.value = '';
		a.oninput();
		this.updateSaveButtons();
	}

	static load(timestamp) {
		let a = this.in(),
			b = document.querySelector(this.ref('date')).innerHTML,
			saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(a.value.trim() !== '' && !confirm(`${ b === Timestamp.toDateString(timestamp) ? 'Восстановить' : 'Загрузить' } сохранение "${ Timestamp.toDateString(timestamp) }"?`)) {
			return;
		}

		a.value = saves[timestamp]
	//	a.scrollTop = 0;
		a.oninput();
		this.updateSavesTable();
		this.updateSaveButtons(timestamp);
		Tab.switch('translate');
		scrollTo(0, 0);
	}

	static save(timestamp = Timestamp.current()) {
		let a = this.in().value,
			b = document.querySelector(this.ref('date')).innerHTML,
			saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(saves[timestamp]?.trim().length > 0 && !confirm(`Перезаписать сохранение "${ Timestamp.toDateString(timestamp) }"?`)) {
			return;
		}

		saves[timestamp] = a;
		localStorage.setItem('saves', JSON.stringify(saves));
		this.updateSavesTable();
		if(b !== Timestamp.toDateString(timestamp)) {
			this.updateSaveButtons(timestamp);
		}
	}

	static delete(timestamp) {
		let a = document.querySelector(this.ref('date')).innerHTML,
			saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(saves[timestamp].trim() !== '' && prompt(`Удалить сохранение "${ Timestamp.toDateString(timestamp) }"? ("Y" для подтверждения).`) !== 'Y') {
			return;
		}

		saves[timestamp] = undefined;
		localStorage.setItem('saves', JSON.stringify(saves));
		this.updateSavesTable();
		if(a === Timestamp.toDateString(timestamp)) {
			this.updateSaveButtons();
		}
	}

	static download(type) {
		if(!['saves', 'accents'].includes(type)) {
			return;
		}

		File.write(localStorage.getItem(type) ?? '', 'application/json', `${ type === 'saves' ? 'Сохранения' : 'Ударения' } (${ Timestamp.toDateString(Timestamp.current()) }).json`);
	}

	static upload(element, type) {
		if(!['saves', 'accents'].includes(type)) {
			return;
		}

		File.read(element, (file) => {
			if(file.type !== 'application/json' || prompt(`Перезаписать базу ${ type === 'saves' ? 'сохранений' : 'ударений' }? ("Y" для подтверждения).`) !== 'Y') {
				return;
			}

			localStorage.setItem(type, file.text);
			this.updateSavesTable();
			this.updateAccentsTable();
		});
	}
}

window.Dictionary = class Dictionary {
	static data = [
		{
			strings: ['А́ка', 'е́си'],
			meanings: ['Если'],
			origins: ['Альт.', 'разг.']
		},
		{
			strings: ['А́неж', 'не́ж'],
			meanings: ['Чем', 'нежели'],
			origins: ['Альт.']
		},
		{
			strings: ['База́р'],
			meanings: ['Рынок'],
			origins: ['Альт.']
		},
		{
			strings: ['Беги́т'],
			meanings: ['Бежит'],
			origins: ['Разг.']
		},
		{
			strings: ['Бле́скаўка'],
			meanings: ['Молния'],
			origins: ['Альт.']
		},
		{
			strings: ['Бо́', 'то́шо̀'],
			meanings: ['Потому что'],
			origins: ['Альт., иск.']
		},
		{
			strings: ['Бреха́ть'],
			meanings: ['Врать', 'лгать'],
			origins: ['Альт.']
		},
		{
			strings: ['Бу́дуюший'],
			meanings: ['Будущий'],
			origins: ['Разг.']
		},
		{
			strings: ['Буря́к'],
			meanings: ['Свекла'],
			origins: ['Альт.']
		},
		{
			strings: ['Бу́ш'],
			meanings: ['Будешь'],
			origins: ['Разг.']
		},
		{
			strings: ['Быё́т'],
			meanings: ['Существует', 'является'],
			origins: ['Иск.']
		},
		{
			strings: ['Ве́льма', 'ду́жэ'],
			meanings: ['Очень'],
			origins: ['Альт.']
		},
		{
			strings: ['Ўнату́ре'],
			meanings: ['Именно, точно (грубо)'],
			origins: ['Разг.']
		},
		{
			strings: ['Ўнедаро́жъе'],
			meanings: ['Бездорожье'],
			origins: ['Разг.']
		},
		{
			strings: ['Ўрѐмяправажде́ние'],
			meanings: ['Времяпрепровождение'],
			origins: ['Иск.']
		},
		{
			strings: ['Ўря́тли'],
			meanings: ['Вряд ли'],
			origins: ['Разг.']
		},
		{
			strings: ['Ўру́г'],
			meanings: ['Враг, притворяющийся другом'],
			origins: ['Иск.']
		},
		{
			strings: ['Ваўсюда́'],
			meanings: ['(В) везде'],
			origins: ['Разг.']
		},
		{
			strings: ['Ваше́'],
			meanings: ['Вообще'],
			origins: ['Разг.']
		},
		{
			strings: ['Выла́зий'],
			meanings: ['Вылезай'],
			origins: ['Разг.']
		},
		{
			strings: ['Ґаплы́к'],
			meanings: ['Конец', 'провал'],
			origins: ['Альт.']
		},
		{
			strings: ['Ґерма́нец'],
			meanings: ['Немец'],
			origins: ['Иск.']
		},
		{
			strings: ['Ґи́ль'],
			meanings: ['Чепуха'],
			origins: ['Устар.']
		},
		{
			strings: ['Ґо́ршэ', 'ху́дшэ'],
			meanings: ['Хуже'],
			origins: ['Альт.', 'разг.']
		},
		{
			strings: ['Деесло́ва'],
			meanings: ['Глагол'],
			origins: ['Альт.']
		},
		{
			strings: ['До́си', 'дасихпо́р'],
			meanings: ['До сих пор'],
			origins: ['Альт.', 'разг.']
		},
		{
			strings: ['Ево́ный'],
			meanings: ['Его'],
			origins: ['Устар.']
		},
		{
			strings: ['Её́ный'],
			meanings: ['Её'],
			origins: ['Устар.']
		},
		{
			strings: ['Еж\'а́й', 'е́хай'],
			meanings: ['Едь'],
			origins: ['Разг.']
		},
		{
			strings: ['Заклапо́тан'],
			meanings: ['Сильно занят'],
			origins: ['Альт.']
		},
		{
			strings: ['Запа́лка'],
			meanings: ['Спичка', 'зажигалка'],
			origins: ['Альт.']
		},
		{
			strings: ['Збро́я'],
			meanings: ['Оружие'],
			origins: ['Альт.']
		},
		{
			strings: ['Здаё́ц\'а'],
			meanings: ['Кажется'],
			origins: ['Альт.']
		},
		{
			strings: ['Здра́сте'],
			meanings: ['Здравствуйте'],
			origins: ['Разг.']
		},
		{
			strings: ['Зя́', 'мо́на'],
			meanings: ['Можно'],
			origins: ['Разг.']
		},
		{
			strings: ['И́ншые'],
			meanings: ['Другие'],
			origins: ['Альт.']
		},
		{
			strings: ['Инэ́т'],
			meanings: ['Интернет'],
			origins: ['Разг.']
		},
		{
			strings: ['И́хний'],
			meanings: ['Их'],
			origins: ['Устар.']
		},
		{
			strings: ['Каву́н'],
			meanings: ['Арбуз'],
			origins: ['Альт.']
		},
		{
			strings: ['Каза́'],
			meanings: ['Говор'],
			origins: ['Иск.']
		},
		{
			strings: ['Капустя́нка'],
			meanings: ['Медведка'],
			origins: ['Альт.']
		},
		{
			strings: ['Карто́пля'],
			meanings: ['Картошка'],
			origins: ['Альт.']
		},
		{
			strings: ['Квито́к'],
			meanings: ['Билет'],
			origins: ['Альт.']
		},
		{
			strings: ['Кане́ш', 'кане́шна'],
			meanings: ['Конечно'],
			origins: ['Разг.']
		},
		{
			strings: ['Кардо́н'],
			meanings: ['Граница'],
			origins: ['Альт.']
		},
		{
			strings: ['Кулё́к'],
			meanings: ['Полиэтиленовый пакет'],
			origins: ['Альт.']
		},
		{
			strings: ['Ларё́к'],
			meanings: ['Киоск'],
			origins: ['Альт.']
		},
		{
			strings: ['Ле́пый'],
			meanings: ['Хороший'],
			origins: ['Устар.']
		},
		{
			strings: ['Ле́пшэ'],
			meanings: ['Лучше'],
			origins: ['Альт.', 'разг.']
		},
		{
			strings: ['Лажы́ть'],
			meanings: ['Класть'],
			origins: ['Разг.']
		},
		{
			strings: ['Ля́ж'],
			meanings: ['Ляг'],
			origins: ['Разг.']
		},
		{
			strings: ['Ма́'],
			meanings: ['Есть'],
			origins: ['Иск.']
		},
		{
			strings: ['Ма́ра'],
			meanings: ['Мечта'],
			origins: ['Альт.']
		},
		{
			strings: ['Матюки́'],
			meanings: ['Матершина'],
			origins: ['Разг.']
		},
		{
			strings: ['Маха́й'],
			meanings: ['Маши'],
			origins: ['Разг.']
		},
		{
			strings: ['Мене́'],
			meanings: ['Мне'],
			origins: ['Устар.']
		},
		{
			strings: ['Мея́', 'мя́'],
			meanings: ['Меня'],
			origins: ['Разг.']
		},
		{
			strings: ['Мо́ж'],
			meanings: ['Можешь'],
			origins: ['Разг.']
		},
		{
			strings: ['Мо́жут'],
			meanings: ['Могут'],
			origins: ['Разг.']
		},
		{
			strings: ['Мо́жэ'],
			meanings: ['Может'],
			origins: ['Разг.']
		},
		{
			strings: ['Мы́ша'],
			meanings: ['Мышь (женского рода)'],
			origins: ['Альт.']
		},
		{
			strings: ['На́жна', 'ну́да'],
			meanings: ['Нужно', 'надо'],
			origins: ['Разг.']
		},
		{
			strings: ['Наро́шна'],
			meanings: ['Нарочно'],
			origins: ['Разг.']
		},
		{
			strings: ['Нема́', 'не́ту'],
			meanings: ['Нет <кого/чего-либо>'],
			origins: ['Разг.']
		},
		{
			strings: ['Немо́жна', 'немо́на'],
			meanings: ['Нельзя'],
			origins: ['Разг.']
		},
		{
			strings: ['Не́сть'],
			meanings: ['Нести'],
			origins: ['Разг.']
		},
		{
			strings: ['Нечя́йна'],
			meanings: ['Нечаянно'],
			origins: ['Разг.']
		},
		{
			strings: ['Ничё́'],
			meanings: ['Ничего'],
			origins: ['Разг.']
		},
		{
			strings: ['Агурки́'],
			meanings: ['Огурцы'],
			origins: ['Альт.']
		},
		{
			strings: ['Апало́ник'],
			meanings: ['Половник'],
			origins: ['Альт.']
		},
		{
			strings: ['Асабли́ва'],
			meanings: ['Особенно'],
			origins: ['Альт.']
		},
		{
			strings: ['Астаража́ц\'а'],
			meanings: ['Остерегаться'],
			origins: ['Иск.']
		},
		{
			strings: ['Атсю́дава'],
			meanings: ['Отсюда'],
			origins: ['Разг.']
		},
		{
			strings: ['Пацу́к'],
			meanings: ['Крыса'],
			origins: ['Альт.']
		},
		{
			strings: ['Пинкадзу́й', 'шуру́й'],
			meanings: ['Иди (грубо)'],
			origins: ['Иск.', 'разг.']
		},
		{
			strings: ['Падшы́бник'],
			meanings: ['Подшипник'],
			origins: ['Разг.']
		},
		{
			strings: ['Пажа́луста'],
			meanings: ['Пожалуйста'],
			origins: ['Разг.']
		},
		{
			strings: ['Пакла́сть'],
			meanings: ['Положить'],
			origins: ['Разг.']
		},
		{
			strings: ['Памо́йму'],
			meanings: ['По-моему'],
			origins: ['Разг.']
		},
		{
			strings: ['Паря́дашный'],
			meanings: ['Порядочный'],
			origins: ['Разг.']
		},
		{
			strings: ['Паследо́ўник'],
			meanings: ['Последователь'],
			origins: ['Альт.']
		},
		{
			strings: ['Паследо́ўнасть'],
			meanings: ['Последовательность'],
			origins: ['Альт.']
		},
		{
			strings: ['Пата́нывает'],
			meanings: ['Тонет'],
			origins: ['Разг.']
		},
		{
			strings: ['Патво́йму'],
			meanings: ['По-твоему'],
			origins: ['Разг.']
		},
		{
			strings: ['Пача́ть'],
			meanings: ['Начать'],
			origins: ['Альт.']
		},
		{
			strings: ['Пра́льна'],
			meanings: ['Правильно'],
			origins: ['Разг.']
		},
		{
			strings: ['Прийдё́т'],
			meanings: ['Придёт'],
			origins: ['Разг.']
		},
		{
			strings: ['Прикла́дка'],
			meanings: ['Приложение'],
			origins: ['Иск.']
		},
		{
			strings: ['Пративапало́жэн\'ый'],
			meanings: ['Противоположный'],
			origins: ['Альт.']
		},
		{
			strings: ['Разуме́ть'],
			meanings: ['Понимать'],
			origins: ['Устар.']
		},
		{
			strings: ['Ро́дычи'],
			meanings: ['Родственники'],
			origins: ['Альт.']
		},
		{
			strings: ['Са́м'],
			meanings: ['[Указание на одиночество]'],
			origins: ['Альт.']
		},
		{
			strings: ['Се́', 'се\'́ '],
			meanings: ['Себе'],
			origins: ['Разг.']
		},
		{
			strings: ['Сё́дня'],
			meanings: ['Сегодня'],
			origins: ['Разг.']
		},
		{
			strings: ['Се́дьмица'],
			meanings: ['Неделя'],
			origins: ['Устар.']
		},
		{
			strings: ['Сея́', 'ся́'],
			meanings: ['Себя'],
			origins: ['Разг.']
		},
		{
			strings: ['Сига́й'],
			meanings: ['Прыгай <вниз/вдаль>'],
			origins: ['Разг.']
		},
		{
			strings: ['Сидю́'],
			meanings: ['Сижу'],
			origins: ['Разг.']
		},
		{
			strings: ['Симпати́шный'],
			meanings: ['Симпатичный'],
			origins: ['Разг.']
		},
		{
			strings: ['Сла́зий'],
			meanings: ['Слезай'],
			origins: ['Разг.']
		},
		{
			strings: ['Сле́ч\'ий'],
			meanings: ['Следователь'],
			origins: ['Альт.']
		},
		{
			strings: ['Сразуме́ла'],
			meanings: ['Понятно'],
			origins: ['Альт.']
		},
		{
			strings: ['Стери́'],
			meanings: ['Сотри'],
			origins: ['Разг.']
		},
		{
			strings: ['Стря́ска'],
			meanings: ['Случай'],
			origins: ['Иск.']
		},
		{
			strings: ['Сува́й'],
			meanings: ['Засовывай'],
			origins: ['Разг.']
		},
		{
			strings: ['Ся́к'],
			meanings: ['Так'],
			origins: ['Устар.']
		},
		{
			strings: ['Та́ма'],
			meanings: ['Там'],
			origins: ['Разг.']
		},
		{
			strings: ['Те́', 'те\'́ '],
			meanings: ['Тебе'],
			origins: ['Разг.']
		},
		{
			strings: ['Те\'́рь', 'те́рь'],
			meanings: ['Теперь'],
			origins: ['Разг.']
		},
		{
			strings: ['Текё́т'],
			meanings: ['Течёт'],
			origins: ['Разг.']
		},
		{
			strings: ['Тея́', 'тя́'],
			meanings: ['Тебя'],
			origins: ['Разг.']
		},
		{
			strings: ['Ти́па'],
			meanings: ['Вроде'],
			origins: ['Разг.']
		},
		{
			strings: ['То́бта', 'тэе́'],
			meanings: ['То есть'],
			origins: ['Альт.', 'иск.']
		},
		{
			strings: ['Тро́шки'],
			meanings: ['Немного'],
			origins: ['Альт.']
		},
		{
			strings: ['Тря́пашный'],
			meanings: ['Тряпочный'],
			origins: ['Разг.']
		},
		{
			strings: ['Ту́та'],
			meanings: ['Тут'],
			origins: ['Разг.']
		},
		{
			strings: ['Тэдэ́'],
			meanings: ['Так далее'],
			origins: ['Иск.']
		},
		{
			strings: ['Тэ́та'],
			meanings: ['Вот это'],
			origins: ['Иск.']
		},
		{
			strings: ['Ужашя́ть'],
			meanings: ['Ужесточать'],
			origins: ['Разг.']
		},
		{
			strings: ['Усе́'],
			meanings: ['Все'],
			origins: ['Альт.']
		},
		{
			strings: ['Ўсераўно́'],
			meanings: ['Всё равно'],
			origins: ['Разг.']
		},
		{
			strings: ['Ўсе́хний'],
			meanings: ['Всех', 'общий'],
			origins: ['Разг.']
		},
		{
			strings: ['Ха́й'],
			meanings: ['Пусть', 'пускай'],
			origins: ['Разг.']
		},
		{
			strings: ['Хапа́ть'],
			meanings: ['Хватать'],
			origins: ['Альт.']
		},
		{
			strings: ['Ха́та'],
			meanings: ['Дом', 'квартира'],
			origins: ['Альт.']
		},
		{
			strings: ['Хма́ра'],
			meanings: ['Туча'],
			origins: ['Альт.']
		},
		{
			strings: ['Харо́ш'],
			meanings: ['Хватит'],
			origins: ['Разг.']
		},
		{
			strings: ['Хате́ю', 'хатю́'],
			meanings: ['Хочу'],
			origins: ['Разг.']
		},
		{
			strings: ['Хати́т'],
			meanings: ['Хочет'],
			origins: ['Разг.']
		},
		{
			strings: ['Хо́ш'],
			meanings: ['Хочешь'],
			origins: ['Разг.']
		},
		{
			strings: ['Ца́цка'],
			meanings: ['Игрушка'],
			origins: ['Альт.']
		},
		{
			strings: ['Чека́ть'],
			meanings: ['Ждать'],
			origins: ['Альт.']
		},
		{
			strings: ['Чепа́ть'],
			meanings: ['Цеплять', 'трогать'],
			origins: ['Альт.']
		},
		{
			strings: ['Чё́'],
			meanings: ['Чего'],
			origins: ['Разг.']
		},
		{
			strings: ['Чё́т'],
			meanings: ['Чего-то'],
			origins: ['Разг.']
		},
		{
			strings: ['Чи́ /ли́/'],
			meanings: [
				'Или',
				'[Усиливает вопросительный (иногда риторический) характер предложения, в начале или возле обращения]',
				'[В паре с отрицательной частицой /не́/ или /ни́/ может означать презительное отношение к кому/чему-либо]'
			],
			origins: ['Альт.']
		},
		{
			strings: ['Чиво́'],
			meanings: ['Чего (эмоционально)'],
			origins: ['Разг.']
		},
		{
			strings: ['Чилинепо́х'],
			meanings: ['Как будто бы на самом деле "не" всё равно (грубо)'],
			origins: ['Иск.']
		},
		{
			strings: ['Чю́ять'],
			meanings: ['Чувствовать', 'слышать'],
			origins: ['Альт.']
		},
		{
			strings: ['Шки́ва'],
			meanings: ['[Матерное оскорбление]'],
			origins: ['Иск.']
		},
		{
			strings: ['Шыпшына'],
			meanings: ['Шиповник'],
			origins: ['Альт.']
		},
		{
			strings: ['Шя́', 'шя́с'],
			meanings: ['Сейчас'],
			origins: ['Разг.']
		},
		{
			strings: ['Што́сь'],
			meanings: ['Что-то'],
			origins: ['Альт.']
		},
		{
			strings: ['Хто́сь'],
			meanings: ['Кто-то'],
			origins: ['Альт.']
		}
	].sort((a, b) => a.strings[0] > b.strings[0] ? 1 : a.strings[0] < b.strings[0] ? -1 : 0);

	static updateTable() {
		let a = $('[data-dictionary-ref="table"]'),
			c = this.data;

		a.html('');
		for(let v of c) {
			a.append(`
				<div>
					<div wrapless_>${ v.strings.join(', ') }</div>
					<div wide_>${ v.meanings.join(', ') }</div>
					<div wrapless_>${ v.origins.join(', ') }</div>
				</div>
			`);
		}
		if($.isEmptyObject(c)) {
			a.append('<div><div>Пусто.</div></div>');
		} else {
			a.prepend(`
				<div __header>
					<div wrapless_>Написание</div>
					<div wide_>Значение</div>
					<div wrapless_>Происхождение</div>
				</div>
			`);
		}
	}
}

document.addEventListener('click', (e) => {
	if(e.target.matches('[data-tab-ref]:not([current_])'))	Tab.switch(e);
	if(e.target.matches('[data-translator-preference]'))	Translator.savePreferences(e);
	if(e.target.matches('[_dropdown]')) {
		$(e.target).attr('active_', (a, b) => b === '' ? null : '');
	} else {
		$('[_dropdown]').removeAttr('active_');
	}
});

document.addEventListener('focus', (e) => {
	if(!e.target.matches('[_dropdown]') || e.target !== e.relatedTarget) {
		$('[_dropdown]').each(function() {
			if(this !== e.target && !$(this).find(e.target).length) {
				$(this).removeAttr('active_');
			}
		});
	}
}, true);

let keydownTimeout;

document.addEventListener('keydown', (e) => {
	if(e.altKey) {
		if(!['AltLeft', 'AltRight'].includes(e.code)) {
			e.preventDefault();

			if(keydownTimeout) {
				return;
			} else {
				keydownTimeout = setTimeout(() => {
					keydownTimeout = clearTimeout(keydownTimeout);
				}, 125);
			}

			if(location.hash.substring(1) === 'translator') {
				({
					KeyS: () => Translator.save(),
					KeyQ: () => Translator.insertAccent(true),
					KeyW: () => Translator.loadAccents(),
					KeyE: () => Translator.insertAccent(),
					KeyR: () => Translator.displayAccents(),
					KeyA: () => Translator.clear(),
					KeyX: () => document.querySelector(Translator.ref('uploadSaves'))?.click(),
					KeyC: () => document.querySelector(Translator.ref('downloadSaves'))?.click(),
					KeyV: () => document.querySelector(Translator.ref('uploadAccents'))?.click(),
					KeyB: () => document.querySelector(Translator.ref('downloadAccents'))?.click(),
					KeyZ: () => {
						let checks = Translator.ref('setting')+' input[type="checkbox"]';

						$(checks).prop('checked', !$(checks).first()[0].checked);
						Translator.savePreferences();
					}
				})[e.code]?.();
			}
			if(e.code === 'KeyN') {
				Navigation.toggle();
			}
		}
	}
	if(e.target.matches('[_dropdown]') && e.code === 'Space') {
		e.preventDefault();
	}
});

document.addEventListener('keyup', (e) => {
	if(e.target.matches('[_dropdown]') && e.code === 'Space') {
		$(e.target).attr('active_', (a, b) => b === '' ? null : '');
	}
});

document.addEventListener('DOMContentLoaded', () => {
	let a = localStorage.getItem('save'),
		b = localStorage.getItem('accent'),
		c = localStorage.getItem('settings');

	if(a != undefined) {
		localStorage.setItem('saves', a);
		localStorage.removeItem('save');
	}
	if(b != undefined) {
		localStorage.setItem('accents', b);
		localStorage.removeItem('accent');
	}
	if(c != undefined) {
		localStorage.setItem('preferences', c);
		localStorage.removeItem('settings');
	}

	Tab.initialize();
	Navigation.initialize();
	Dropdown.initialize();
	Translator.updateSavesTable();
	Translator.updateAccentsTable();
	Translator.loadPreferences(true);
	Dictionary.updateTable();
});