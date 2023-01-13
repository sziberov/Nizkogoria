window.Tab = class Tab {
	static globalPostfix = ' ☆ НССР';

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

window.Notifications = class Notifications {
	static list = () => $('ul[_notifications]');

	static push(string) {
		let notification = $('<li/>').text(string).appendTo(this.list());

		console.log(string);

		setTimeout(() => notification.remove(), 8000);
	}
}

window.Editor = class {
	static initialize(element, beforeinput) {
		if(element.attributes['_textarea'] == null) {
			return;
		}

		element.setAttribute('contenteditable', true);
		element.spellcheck = false;
		element.onbeforeinput = beforeinput;
	}

	static getText(element) {
		let value = element.innerText;

		if(value.at(-1) === '\n') {
			value = value.slice(0, -1);
		}

		return value;
	}

	static getTextSelection(element) {
		let selection = getSelection(),
			range,
			range_,
			start,
			end;

		if(selection != null && selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
			range_ = range.cloneRange();

			range_.selectNodeContents(element);
			range_.setEnd(range.startContainer, range.startOffset);

			start = range_.toString().length;

			range_.setEnd(range.endContainer, range.endOffset);

			end = range_.toString().length;
		} else {
			return;
		}

		return {
			start: start,
			end: end
		}
	}

	static setTextSelection(element, position) {
		let length = 0;

		for(let node of element.childNodes) {
			let innerText = node.innerText ?? node.nodeValue ?? '';

			length = length+innerText.length;

			if(position <= length) {
				let selection = window.getSelection(),
					range = document.createRange(),
					offset = position-(length-innerText.length);

				if(node.nodeName !== '#text') {
					offset = offset > innerText.length/2 ? 1 : 0;
				}

				range.setStart(node, offset);
				range.collapse(true);

				selection.removeAllRanges();
				selection.addRange(range);

				return;
			}
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

	static removeAt(string, index, length) {
		return string.substring(0, index)+string.substring(index+length);
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

	static numberPostfix(number) {
		let a = number.toString().slice(-1),
			b = number.toString().slice(-2, -1),
			c = 'штук';

		return b !== '1' ? a === '1' ? c+'а' : ['2', '3', '4'].includes(a) ? c+'и' : c : c;
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
			'г(?!..?г)':				'ґ',
		//	'(ис)?под(?=[кпстфхцчшщ])':	'$1пот',
			'(под|с)ним':				['$1ым', 'nim-ym'],
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
			'инер(?=т|ц)':	'инэр',
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

			'ф(?=[аеёиоуыэюя]|ь[еёиоюя])':	['хв', 'f-hv'],
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

			'ча':				'чя',
		//	'чески':			'чны',
			'ч(?=ж|ш)':			['д', 'chzh_chsh-dzh_dsh'],
			'что(?![вл])':		'што',
			'чо':				'чё',
			'чу':				'чю',
			'чэ':				'че',
			'чють(?=-чють)':	'чю',

			'ше':				'шэ',
			'шё':				'шо',
			'ши':				'шы',
			'шоколад':			'шэколад',
			'шт(?=[клмнш])':	'ш',
			'ште(?=йн|пс)':		'штэ',
			'што':				['шо', 'shto-sho'],
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

			'([бклмрф])\\1':												'$1',
			'([бвп])ь(?=[еёиюя])':											'$1ъ',
			'в(?=ь?[ \\t\\p{P}]+[кпстфхцчшщ])':								'ф',
			'(?<=^|[\\s\\d\\p{P}]+)[вф](?=[ \\t\\p{P}]+[^аеёиоуыэюя])':		['ў', 'v_l_f-short_u'],
			'(?<=^|[\\s\\d\\p{P}]+|[аеёиоуыэюя])[влф](?![аеёиоуъыьэюя])':	['ў', 'v_l_f-short_u'],
			'вот(?=[- \\t]+так)':											'о',
			'(г|ґ)енез':													'$1енэз',
			'[дт]ь?(?=(д|т)[еёиьюя])':										'$1',
		//	'(?<=\\S{4,})евае':												'иё',
			'(?<=\\S{5,})еви(ч|ш)':											['и$1', 'evi_ovi-i_y'],
			'(?<=\\S{5,})(?:[ди]р)?ови(ч|ш)':								['ы$1', 'evi_ovi-i_y'],
			'(?<!пер)его(?!дя|м|р)':										'ево',
			'(?<=^|[\\s\\d\\p{P}])(а|у)?ж(?=[ \\t\\p{P}]+[кпстфхцчшщ])':	'$1ш',
			'([жцчшщ])ь(?=[^еёиюя]|$)':										'$1',
			'([жцш])ь(?=[еёиюя])':											'$1ъ',
		//	'(з|с)(?=[днст][еёиьюя])':										['$1ь', *],
			'(?<=[бвгджз][ \\t]+)и':										['ы', 'i_je-y'],
			'(?<=[^аеёийоучщыьэюя\\p{P}][ \\t]+)(е(?=во|ё)|и)':				['ы', 'i_je-y'],
		//	'(?<=[чщь][ \\t]+)е(?=ё)':										['и', 'i_je-y'],
			'(?<=\\S([бвзнпртф]))ир(?=ов|у(?!с))':							'',
			'(?<=\\Sл)иро(?=в(анн|ыва))':									'ё',
			'(?<=\\Sл)иро':													'я',
			'(?<=\\Sл)иру':													'ю',
			'(?<=\\Sсц)ыр(?=[оу])':											'',
			'(?<=\\S)цыр(?=[оу])':											'к',
			'(?<!ка)пле(?=е|й)':											'плэ',
			'(?<!пе)рейд':													'рэйд',
			'(ф|хв)анер':													'$1анэр',
			'(ф|хв)онет':													'$1онэт',
			'т(?=[еёиюья])':												['ц', 't-c'],
			'щ(?=[еёищюя])':												'ш',
			'щь?':															'шь',
			'((?<=м)|с?т)ьдесят':											'сят',
			'((?<=м)|с?т)ьсот':												'сот'
		},
		ending: { // В конце слова
		//	'в':	'ф',
		//	'г':	'х',
			'ее':	['ей', 'jeje-jey'],
			'име':	'имэ',
			'стр':	'стор',
		//	'сь':	'ся',
			'эго':	'эво',

			'[дт]с((?:ам|ов)?[аиуы]?)':						'ц$1',
			'цца':											['тса', 'ca_sya-sa'],
			'ц((?:ам|ов)?[аиуы]?)':							['тс$1', 'ca_sya-sa'],
			'(?<!а)кто':									'хто',
		//	'(?<=и)нет':									'нэт',
			'ни([еёюя][вм]?)':								['нь$1', 'ni-n'],
			'ни(и[вм]?)':									['ньи', 'ni-n'],
			'(л|ў)ся':										['$1са', 'ca_sya-sa'],
			'(?<!дор|л|(?<![уў])мн|(?<!бы|о)стр)ого(-.*)?':	'ово$1',
			'ые':											['ыэ', 'yje-ye'],
		//	'(?<!л)ь(ся|те)':								'$1',
			'([^еёиюя])\\1':								'$1'
		}
	}

	static pronouns = [
		'кем', 'кого', 'ком', 'кому', 'кто',
		'чем', 'чего', 'чём', 'чему', 'что',
		'кое', 'коего', 'коей', 'коем', 'коему', 'коею', 'кои', 'коим', 'коими', 'коих', 'кой', 'кою', 'коя',
		'какая', 'какие', 'каким', 'какими', 'каких', 'какого', 'какое', 'какой', 'каком', 'какому', 'какую',
		'такая', 'такие', 'таким', 'такими', 'таких', 'такого', 'такое', 'такой', 'таком', 'такому', 'такую',
		'чей', 'чьего', 'чьей', 'чьей', 'чьему', 'чьею', 'чьи', 'чьим', 'чьими', 'чьих', 'чью', 'чья', 'чьё', 'чьём',
		'когда', 'тогда',
		'где', 'там', 'тама', 'тут', 'тута',
		'куда', 'откуда', 'туда', 'оттуда',
		'как', 'так', 'сяк',
		'скольким', 'сколькими', 'скольких', 'сколько',
		'стольким', 'столькими', 'стольких', 'столько'
	]

	static preferences = {}

	static ref = (title) => `[data-translator-ref="${ title }"]`;

	static in = () => document.querySelector(this.ref('in'));
	static out = () => document.querySelector(this.ref('out'));

	static raw = '';
	static parsed = []

	static parse(raw) {
		let alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
			word = `([${ alphabet+Characters.grave+Characters.acute }])+`,
			symbol = `([^${ alphabet+Characters.grave+Characters.acute }])+`,
			parsed = raw.match(new RegExp(word+'|'+symbol, 'gi')) ?? []

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

			for(let i = 0; i < v.string.length; i++) {
				if(v.string[i+1] === Characters.grave) {
					v.graveIndex = i;
				}
				if(v.string[i+1] === Characters.acute) {
					v.acuteIndex = i;
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
				if(v.graveIndex != null) {
					v.string = Characters.insertAt(v.string, v.graveIndex+1, Characters.grave);
				}
				if(v.acuteIndex != null) {
					v.string = Characters.insertAt(v.string, v.acuteIndex+1, Characters.acute);
				}
			}

			raw += v.string;
		}

		return raw;
	}

	static go() {
		let parsed = this.parse(this.raw),
			ruleEnabled = (value, returnReplacement) => {
				let preferable = Array.isArray(value),
					enabled = this.preferences[value[1]] ?? false;

				return returnReplacement ? (preferable ? value[0] : value) : (preferable ? enabled : true);
			}

		for(let k in parsed) {
			let v = parsed[k]

			if(v?.type !== 'word') {
				continue;
			}

			// Применение общих правил замены

			k = k*1;

			let originalString = v.string,
				leftmost = parsed[k-2] ?? { string: '' },
				left = parsed[k-1] ?? { string: '' },
				right = parsed[k+1] ?? { string: '' },
				rightmost = parsed[k+2] ?? { string: '' },
				start = leftmost.string.length+left.string.length,
				length = v.string.length;

			v.string = leftmost.string+left.string+v.string+right.string+rightmost.string;

			for(let type of ['beginning', 'everywhere', 'ending']) {
				let rules = this.rules[type]

				for(let k in rules) {
					if(!ruleEnabled(rules[k])) {
						continue;
					}

					let regex;

					if(type === 'beginning') {
						regex = new RegExp('(?<=^|[\\s\\d\\p{P}])'+k+'(?=\\S)', 'giu');
					}
					if(type === 'everywhere') {
						regex = new RegExp(k, 'giu');
					}
					if(type === 'ending') {
						regex = new RegExp('(?<=\\S)'+k+'(?=$|[\\s\\d\\p{P}])', 'giu');
					}

					let originalStart = start,
						originalLength = length;

					v.string = v.string.replace(regex, (match, ...captureGroups) => {
						let replacement = ruleEnabled(rules[k], true),
							matchStart = captureGroups[captureGroups.length-2]

						replacement = Characters.applyCaptureGroups(replacement, ...captureGroups);
						replacement = Characters.replacePreservingCase(match, replacement);

						let difference = match.length-replacement.length;

						if(matchStart < originalStart) {
							start -= difference;
						} else
						if(matchStart < originalStart+originalLength) {
							length -= difference;

							if(v.graveIndex > matchStart-originalStart) {
								v.graveIndex -= difference;
							}
							if(v.acuteIndex > matchStart-originalStart) {
								v.acuteIndex -= difference;
							}
						}

						return replacement;
					});
				}
			}

			v.string = v.string.substring(start, start+length);

			// Замена безударного постфикса "-то" на "(о)сь" во фиксированном списке местоимений

			if(
				this.preferences['to-s_os'] &&
				this.pronouns.includes(originalString.toLowerCase()) &&
				right.string === '-' && rightmost.string.toLowerCase() === 'то' &&
				rightmost.graveIndex !== 1 && rightmost.acuteIndex !== 1
			) {
				let connection = /[^аеёийоуўыэюя]/i.test(v.string.at(-1)) ? 'о' : '',
					replacement = Characters.replacePreservingCase(rightmost.string, connection+'сь');

				v.string += replacement;

				parsed.splice(k+1, 2);
			}

			// Замена безударного "О" на "А" и предударного "Е" на "Я"

			if((this.preferences['o-a'] || this.preferences['je-ja'])) {
				for(let i = 0; i < v.string.length; i++) {
					if(
						this.preferences['o-a'] &&
						v.string[i].toLowerCase() === 'о' &&
						i !== v.graveIndex && i !== v.acuteIndex
					) {
						v.string = Characters.replaceAt(v.string, i, Characters.replacePreservingCase(v.string[i], 'а'));
					}
					if(
						this.preferences['je-ja'] &&
						v.string[i].toLowerCase() === 'е' &&
						i < (v.graveIndex ?? Infinity) && i < (v.acuteIndex ?? Infinity)
					) {
						v.string = Characters.replaceAt(v.string, i, Characters.replacePreservingCase(v.string[i], 'я'));
					}
				}
			}

			// Замена безударных "Ива" и "Ыва" на "Ю" и "У"

			if(this.preferences['iva_yva-ju_u']) {
				let matches = [...v.string.matchAll(/[иы](?=ва[еёйюя]\S*)/gi)]

				for(let match of matches) {
					if(
						v.graveIndex === match.index ||
						v.graveIndex === match.index+2 ||
						v.acuteIndex === match.index ||
						v.acuteIndex === match.index+2
					) {
						continue;
					}

					let replacement = match[0] === 'и' && /[^бвгґдкх]/i.test(v.string[match.index-1]) ? 'ю' : 'у';

					v.string = Characters.replaceAt(v.string, match.index, Characters.replacePreservingCase(v.string[match.index], replacement));
					v.string = Characters.removeAt(v.string, match.index+1, 2);

					if(v.graveIndex > match.index+2) {
						v.graveIndex -= 2;
					}
					if(v.acuteIndex > match.index+2) {
						v.acuteIndex -= 2;
					}
				}
			}

			// Замена дублирующихся букв на апострофы

			if(this.preferences.apostrophe) {
				for(let i = v.string.length-1; i > -1; i--) {
					if(v.string[i] === v.string[i-1]) {
						v.string = Characters.replaceAt(v.string, i, `'`);
					}
				}
			}
		}

		this.out().value = this.unparse(parsed);
	}

	static loadPreferences(initialisation) {
		let preferences = JSON.parse(localStorage.getItem('preferences')) ?? {}

		this.preferences = {}

		if(initialisation) {
			this.savePreferences();
		}
		for(let k in preferences.translator) {
			let element = document.querySelector('[data-translator-preference="'+k+'"]');

			if(element == null) {
				continue;
			}

			this.preferences[k] = preferences.translator[k]

			if(initialisation) {
				element.checked = preferences.translator[k]
			}
		}

		this.go();
	}

	static savePreferences(event) {
		let preferences = JSON.parse(localStorage.getItem('preferences')) ?? {},
			inDOMPreferences = event == null ? document.querySelectorAll('[data-translator-preference]') : [event.srcElement]

		preferences.translator ??= {}

		for(let v of inDOMPreferences) {
			let k = v.dataset.translatorPreference;

			if(k == null || event == null && preferences.translator[k] != null) {
				continue;
			}

			preferences.translator[k] = v.checked;
		}

		localStorage.setItem('preferences', JSON.stringify(preferences));
		if(event != null) {
			this.loadPreferences();
		}
	}

	static loadEditor() {
		Editor.initialize(this.in(), this.editorBeforeinput.bind(this));
		this.updateEditor();
	}

	static updateEditor(selectionStart) {
		let input = this.in(),
			output = this.out(),
			value = '';

		selectionStart ??= Editor.getTextSelection(input)?.start ?? 0;
		this.parsed = this.parse(this.raw);

		for(let k in this.parsed) {
			let v = this.parsed[k],
				string = v.string;

			if(v.type === 'symbol') {
				value += string;

				continue;
			}

			let active;

			for(let i = 0; i < string.length; i++) {
				let character = string[i]

				if(!/[аеёиоуыэюя]/i.test(character)) {
					value += character;
				} else {
					active = '';

					if([v.graveIndex, v.acuteIndex].includes(i)) {
						active = 'active';
						character = character+(v.graveIndex !== i ? Characters.acute : Characters.grave);
					}

					value += '<a role="button" onclick="Translator.insertAccentBy('+k+', '+i+');" accent_="'+active+'">'+character+'</a>';
				}
			}
		}

		input.innerHTML = value;

		if(this.raw.length <= 128) {
			input.setAttribute('zoom_', '');
			output.setAttribute('zoom_', '');
		} else {
			input.removeAttribute('zoom_');
			output.removeAttribute('zoom_');
		}
		Editor.setTextSelection(input, selectionStart);
		$(this.ref('clear'))[this.raw.length > 0 ? 'attr': 'removeAttr']('onclick', 'Translator.clear();');
		this.go();
	}

	static compositionData;

	static editorBeforeinput(event) {
		event.preventDefault();

	//	console.log(event);

		let selection = Editor.getTextSelection(this.in());

		if(selection == null) {
			return;
		}

		let type = event.inputType;

		if(type === 'insertCompositionText') {
			this.compositionData = event.data;

			return;
		}
		if(['insertText', 'insertParagraph', 'insertFromPaste', 'insertFromDrop'].includes(type)) {
			if(selection.start < selection.end) {
				this.raw = Characters.removeAt(this.raw, selection.start, selection.end-selection.start);
			}

			let data = event.data ?? '';

			if(this.compositionData != null) {
				data = this.compositionData+data;
				this.compositionData = undefined;
			}
			if(type === 'insertParagraph') {
				data = '\n';
			}
			if(['insertFromPaste', 'insertFromDrop'].includes(type)) {
				data = event.dataTransfer.getData('text');
			}

			data = data.replaceAll('\r\n', '\n');

			this.raw = Characters.insertAt(this.raw, selection.start, data);

			if(type === 'insertFromPaste') {
				selection.start = selection.start+data.length;
			} else
			if(type !== 'insertCompositionText') {
				selection.start++;
			}
		}
		if(type === 'deleteContentBackward' && selection.start === selection.end) {
			if(selection.start === 0) {
				return;
			}

			if(this.compositionData != null) {
				this.compositionData = undefined;

				return;
			}

			let length = 1;

			if([Characters.grave, Characters.acute].includes(this.raw[selection.start-length])) {
				length++;
			}

			this.raw = Characters.removeAt(this.raw, selection.start-length, length);
			selection.start -= length;
		} else
		if(['deleteContentBackward', 'deleteByCut', 'deleteByDrag'].includes(type)) {
			this.raw = Characters.removeAt(this.raw, selection.start, Math.max(selection.end-selection.start, 1));
		}

		this.updateEditor(selection.start);
	}

	static loadAccents() {
		let accents = Object.entries(JSON.parse(localStorage.getItem('accents')) ?? {}),
			parsed = this.parse(this.raw);

		accents.sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0);

		for(let k in parsed) {
			let v = parsed[k]

			if(v.type !== 'word' || v.graveIndex != null || v.acuteIndex != null) {
				continue;
			}

			let string = v.string.toLowerCase(),
				closest = accents.filter(v => string.includes(v[0])).sort((a, b) => a[0].length > b[0].length ? -1 : a[0].length < b[0].length ? 1 : 0)[0],
				exception = string === 'то' && parsed[k-1]?.string === '-' && parsed[k-2]?.type === 'word';	// Изначально безударный постфикс "-то"

			if(closest != null && !exception) {
				let offset = string.indexOf(closest[0]) ?? 0;

				if(closest[1].graveIndex != null) {
					v.graveIndex = closest[1].graveIndex+offset;
				}
				if(closest[1].acuteIndex != null) {
					v.acuteIndex = closest[1].acuteIndex+offset;
				}
			}
		}

		this.raw = this.unparse(parsed, true);
		this.updateEditor();
	}

	static saveAccents(ofSelected) {
		let selection = Editor.getTextSelection(this.in()),
			accents = JSON.parse(localStorage.getItem('accents')) ?? {},
			notifications = {
				added: [],
				updated: [],
				deleted: []
			}

		for(let v of this.parse(this.raw)) {
			let k = v.string.toLowerCase();

			if(v.type !== 'word' || ofSelected && (selection.start === selection.end ? selection.start < v.start || selection.end-1 > v.end : selection.start > v.start || selection.end-1 < v.end)) {
				continue;
			}
			if(v.graveIndex == undefined && v.acuteIndex == undefined) {
				if(accents[k] != undefined) {
					notifications.deleted.push(k);
					delete accents[k]
				}

				continue;
			}

			notifications[accents[k] != undefined ? 'updated' : 'added'].push(k);
			accents[k] = {
				graveIndex: v.graveIndex,
				acuteIndex: v.acuteIndex
			}
		}

		localStorage.setItem('accents', JSON.stringify(accents));
		this.updateAccentsTable();
		for(let k in notifications) {
			if(notifications[k].length > 0) {
				Notifications.push(`${ k === 'added' ? 'Добавлено' : k === 'updated' ? 'Обновлено' : 'Удалено' } ударение для: ${ notifications[k].join(', ') }`);
			}
		}
	}

	static displayAccents() {
		let accents = JSON.parse(localStorage.getItem('accents')) ?? {},
			parsed = []

		if(this.raw.trim() !== '' && !confirm(`Отобразить базу ударений вместо текущего текста?`)) {
			return;
		}

		for(let k in accents) {
			parsed.push({
				string: k,
				graveIndex: accents[k].graveIndex,
				acuteIndex: accents[k].acuteIndex
			});
		}

		parsed.sort((a, b) => a.string > b.string ? 1 : a.string < b.string ? -1 : 0);

		for(let k = parsed.length-1; k > 0; k--) {	// Переносы строк между словами
			parsed.splice(k, 0, { string: '\n' });
		}

		this.raw = this.unparse(parsed, true);
		this.updateEditor();
		this.updateSaveButtons();
		Tab.switch('translate');
		scrollTo(0, 0);
	}

	static scrolled(element) {
		let input = this.in(),
			output = this.out(),
			scrolled = $(this.ref(element.dataset.translatorRef)+':hover').length > 0;	// element.matches(':hover');

		if(scrolled) {
			if(element === input) {
				output.scrollTop = input.scrollTop;
			}
			if(element === output) {
				input.scrollTop = output.scrollTop;
			}
		}
	}

	static insertAccent(grave) {
		let selection = Editor.getTextSelection(this.in()),
			selectionStart = selection.end-selection.start === 1 ? selection.start+1 : selection.start;

		let word = this.parsed.find(v => v.type === 'word' && v.start <= selectionStart-1 && v.end >= selectionStart-1);

		if(word == null) {
			return;
		}

		let characterIndex = selectionStart-word.start-1;

		for(let i = selectionStart-1; i > word.start; i--) {
			if([Characters.grave, Characters.acute].includes(this.raw[i])) {
				characterIndex--;
			}
		}

		if(![word.graveIndex, word.acuteIndex].includes(characterIndex)) {
			if(!/[аеёиоуыэюя]/i.test(word.string[characterIndex])) {
				return;
			}

			if(grave) {
				if(word.acuteIndex == null || characterIndex >= word.acuteIndex) {
					return;
				}

				word.graveIndex = characterIndex;
			} else {
				word.acuteIndex = characterIndex;
			}
		} else {
			if(word.graveIndex === characterIndex) {
				delete word.graveIndex;
			} else {
				delete word.graveIndex;
				delete word.acuteIndex;
			}
		}

		this.raw = this.unparse(this.parsed, true);
		this.updateEditor(word.start+characterIndex+(word.graveIndex <= characterIndex ? 1 : 0)+(word.acuteIndex <= characterIndex ? 1 : 0)+1);
	}

	static insertAccentBy(wordIndex, characterIndex) {
		let word = this.parsed[wordIndex]

		if(word == null || word.type !== 'word') {
			return;
		}

		if(word.acuteIndex == null) {
			word.graveIndex = undefined;
			word.acuteIndex = characterIndex;
		} else
		if(word.acuteIndex === characterIndex) {
			word.acuteIndex = word.graveIndex;
			word.graveIndex = undefined;
		} else
		if(word.acuteIndex < characterIndex) {
			word.acuteIndex = characterIndex;
		}

		if(word.acuteIndex > characterIndex) {
			word.graveIndex = word.graveIndex !== characterIndex ? characterIndex : undefined;
		}

		this.raw = this.unparse(this.parsed, true);
		this.updateEditor();
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
						${ saves_.length+' '+Characters.numberPostfix(saves_.length) }
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
					<div wrapless_>Позиция буквы под побочным ударением</div>
					<div wrapless_>Позиция буквы под основным ударением</div>
					<div wide_>${ accents_.length+' '+Characters.numberPostfix(accents_.length) }</div>
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
		if(this.raw.trim() !== '' && !confirm(`Очистить поле ввода?`)) {
			return;
		}

		this.raw = '';
		this.updateEditor();
	}

	static close(timestamp) {
		let saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(saves[timestamp] !== this.raw && !confirm(`Закрыть сохранение "${ Timestamp.toDateString(timestamp) }"?`)) {
			return;
		}

		this.raw = '';
		this.updateEditor();
		this.updateSaveButtons();
	}

	static load(timestamp) {
		let date = document.querySelector(this.ref('date')).innerHTML,
			saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(this.raw.trim() !== '' && !confirm(`${ date === Timestamp.toDateString(timestamp) ? 'Восстановить' : 'Загрузить' } сохранение "${ Timestamp.toDateString(timestamp) }"?`)) {
			return;
		}

		this.raw = saves[timestamp]
		this.updateEditor();
		this.updateSavesTable();
		this.updateSaveButtons(timestamp);
		Tab.switch('translate');
		scrollTo(0, 0);
	}

	static save(timestamp = Timestamp.current()) {
		let date = document.querySelector(this.ref('date')).innerHTML,
			saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(saves[timestamp]?.trim().length > 0 && !confirm(`Перезаписать сохранение "${ Timestamp.toDateString(timestamp) }"?`)) {
			return;
		}

		saves[timestamp] = this.raw;
		localStorage.setItem('saves', JSON.stringify(saves));
		this.updateSavesTable();
		if(date !== Timestamp.toDateString(timestamp)) {
			this.updateSaveButtons(timestamp);
		}
	}

	static delete(timestamp) {
		let date = document.querySelector(this.ref('date')).innerHTML,
			saves = JSON.parse(localStorage.getItem('saves')) ?? {}

		if(saves[timestamp].trim() !== '' && prompt(`Удалить сохранение "${ Timestamp.toDateString(timestamp) }"? ("Y" для подтверждения).`) !== 'Y') {
			return;
		}

		saves[timestamp] = undefined;
		localStorage.setItem('saves', JSON.stringify(saves));
		this.updateSavesTable();
		if(date === Timestamp.toDateString(timestamp)) {
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
			strings: ['Абу́тки'],
			meanings: ['Обувь'],
			origins: ['Иск.']
		},
		{
			strings: ['Аде́тки'],
			meanings: ['Одежда'],
			origins: ['Иск.']
		},
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
			strings: ['Бегё́ц\'а'],
			meanings: ['Бежится'],
			origins: ['Разг.']
		},
		{
			strings: ['Бле́скаўка'],
			meanings: ['Молния'],
			origins: ['Альт.']
		},
		{
			strings: ['Бо́', 'таму́шта', 'то́што̀'],
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
			strings: ['Во́шем'],
			meanings: ['В общем'],
			origins: ['Разг.']
		},
		{
			strings: ['Ўважа́ть'],
			meanings: ['Считать <что-то/кого-то> <чем-то/кем-то/каким-то>'],
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
			strings: ['Вабше́', 'ваше́'],
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
			strings: ['Дало́нь'],
			meanings: ['Ладонь'],
			origins: ['Альт.']
		},
		{
			strings: ['Деесло́ва'],
			meanings: ['Глагол'],
			origins: ['Альт.']
		},
		{
			strings: ['Дли́ншэ'],
			meanings: ['Длиннее'],
			origins: ['Разг.']
		},
		{
			strings: ['До́ка'],
			meanings: ['Пока'],
			origins: ['Альт.']
		},
		{
			strings: ['До́си', 'дасихпо́р'],
			meanings: ['До сих пор'],
			origins: ['Альт.', 'разг.']
		},
		{
			strings: ['Ево́ный', 'ево́вый'],
			meanings: ['Его'],
			origins: ['Устар.']
		},
		{
			strings: ['Её́ный', 'её́вый'],
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
			strings: ['Исхажда́ть'],
			meanings: ['Исходить (что делать?)'],
			origins: ['Разг.']
		},
		{
			strings: ['И́хний', 'и́хавый'],
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
			strings: ['Каро́тшэ', 'караче́\''],
			meanings: ['Короче'],
			origins: ['Разг.']
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
			strings: ['Ма́ец\'а'],
			meanings: ['Имеется'],
			origins: ['Альт.']
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
			strings: ['Набалда́жник'],
			meanings: ['Наболдашник'],
			origins: ['Разг.']
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
			meanings: ['Нет <чего/кого-либо>'],
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
			strings: ['Никаво́ный', 'никаво́йный', 'никаво́вый'],
			meanings: ['Ничей'],
			origins: ['Иск.']
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
			strings: ['Пали́ть'],
			meanings: ['Жечь, стрелять'],
			origins: ['Альт.']
		},
		{
			strings: ['Пальба́'],
			meanings: ['Стрельба'],
			origins: ['Альт.']
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
			strings: ['Пинкадзу́й', 'шуру́й'],
			meanings: ['Иди (грубо)'],
			origins: ['Иск.', 'разг.']
		},
		{
			strings: ['Плинтуа́р'],
			meanings: ['Тротуар'],
			origins: ['Иск.']
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
			strings: ['Раздё́вывать'],
			meanings: ['Раздевать'],
			origins: ['Разг.']
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
			strings: ['Сига́ть'],
			meanings: ['Далеко прыгать (в т.ч. под воду)'],
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
			strings: ['Созда́ча'],
			meanings: ['Создавание'],
			origins: ['Разг.']
		},
		{
			strings: ['Сразуме́ла'],
			meanings: ['Понятно'],
			origins: ['Альт.']
		},
		{
			strings: ['Стаё́т'],
			meanings: ['Становится'],
			origins: ['Альт.']
		},
		{
			strings: ['Старадре́вний'],
			meanings: ['Стародавний', 'очень древний'],
			origins: ['Разг.']
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
			strings: ['Тру́сиц\'а'],
			meanings: ['Трясётся'],
			origins: ['Разг.']
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
			strings: ['Ўсе́хний', 'ўсе́йный', 'ўсе́хавый'],
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
			strings: ['Хало́жэ'],
			meanings: ['Холоднее'],
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
			strings: ['Чему́'],
			meanings: ['Почему'],
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
				'Или\n',
				'[Усиливает вопросительный (иногда риторический) характер предложения, в начале или возле обращения]\n',
				'[В паре с отрицательной частицой /не́/ или /ни́/ может означать презительное отношение к кому/чему-либо]'
			],
			origins: ['Альт.']
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
			strings: ['Шё́'],
			meanings: ['Ещё'],
			origins: ['Иск.']
		},
		{
			strings: ['Шя́', 'шя́с'],
			meanings: ['Сейчас'],
			origins: ['Разг.']
		},
		{
			strings: ['Ґа́рлик'],
			meanings: ['Чеснок'],
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
					<div wide_>${ v.meanings.join(', ').replaceAll('\n, ', '<br>') }</div>
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
					KeyD: () => Translator.saveAccents(true),
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
	Tab.initialize();
	Navigation.initialize();
	Dropdown.initialize();
	Translator.updateSavesTable();
	Translator.updateAccentsTable();
	Translator.loadPreferences(true);
	Translator.loadEditor();
	Dictionary.updateTable();
});