var NEXT_DAY = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    NONE: 7
}

var EASTER_WEEK_HOLIDAYS = [
    { day: -3, daysToSum: NEXT_DAY.NONE, celebration: 'Jueves Santo' },
    { day: -2, daysToSum: NEXT_DAY.NONE, celebration: 'Viernes Santo' },
    { day: 39, daysToSum: NEXT_DAY.MONDAY, celebration: 'Ascensión del Señor' },
    { day: 60, daysToSum: NEXT_DAY.MONDAY, celebration: 'Corphus Christi' },
    { day: 68, daysToSum: NEXT_DAY.MONDAY, celebration: 'Sagrado Corazón de Jesús' }
];

var HOLIDAYS = [
    { day: '01-01', daysToSum: NEXT_DAY.NONE, celebration: 'Año Nuevo' },
    { day: '05-01', daysToSum: NEXT_DAY.NONE, celebration: 'Día del Trabajo' },
    { day: '07-20', daysToSum: NEXT_DAY.NONE, celebration: 'Día de la Independencia' },
    { day: '08-07', daysToSum: NEXT_DAY.NONE, celebration: 'Batalla de Boyacá' },
    { day: '12-08', daysToSum: NEXT_DAY.NONE, celebration: 'Día de la Inmaculada Concepción' },
    { day: '12-25', daysToSum: NEXT_DAY.NONE, celebration: 'Día de Navidad' },
    { day: '01-06', daysToSum: NEXT_DAY.MONDAY, celebration: 'Día de los Reyes Magos' },
    { day: '03-19', daysToSum: NEXT_DAY.MONDAY, celebration: 'Día de San José' },
    { day: '06-29', daysToSum: NEXT_DAY.MONDAY, celebration: 'San Pedro y San Pablo' },
    { day: '08-15', daysToSum: NEXT_DAY.MONDAY, celebration: 'La Asunción de la Virgen' },
    { day: '10-12', daysToSum: NEXT_DAY.MONDAY, celebration: 'Día de la Raza' },
    { day: '11-01', daysToSum: NEXT_DAY.MONDAY, celebration: 'Todos los Santos' },
    { day: '11-11', daysToSum: NEXT_DAY.MONDAY, celebration: 'Independencia de Cartagena' }
];

var MILLISECONDS_DAY = 86400000;

function getColombiaHolidaysByYear(year) {
	if (!year) {
		throw 'No year provided'
	} else {
		year = year.toString();
		if (!year.match(/^\d*$/g)) {
			throw 'The year is not a number'
		} else if (year < 1970 || year > 99999) {
			throw 'The year should be greater to 1969 and smaller to 100000'
		} else {
			var normalHolidays = HOLIDAYS.map((element, index, array) => {
				return {
					holiday: nextDay(year.toString().concat('-').concat(element.day), element.daysToSum),
					celebrationDay: year.toString().concat('-').concat(element.day),
					celebration: element.celebration
				};
			});
			var sunday = new Date(butcherAlgorithm(year));
			var easterWeekHolidays = EASTER_WEEK_HOLIDAYS.map((element, index, array) => {
				var day = new Date(sunday.getTime() + element.day * MILLISECONDS_DAY);
				return {
					holiday: nextDay(getFormattedDate(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()), element.daysToSum),
					celebrationDay: getFormattedDate(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()),
					celebration: element.celebration
				};
			});
			return normalHolidays.concat(easterWeekHolidays).sort((a, b) => {
				return new Date(a.holiday) - new Date(b.holiday);
			});
			;
		}
	}
}

function butcherAlgorithm(year) {
	var year = parseInt(year);
	var A = year % 19;
	var B = Math.floor(year / 100);
	var C = year % 100;
	var D = Math.floor(B / 4);
	var E = B % 4;
	var F = Math.floor((B + 8) / 25);
	var G = Math.floor((B - F + 1) / 3);
	var H = (19 * A + B - D - G + 15) % 30;
	var I = Math.floor(C / 4);
	var K = C % 4;
	var L = (32 + 2 * E + 2 * I - H - K) % 7;
	var M = Math.floor((A + 11 * H + 22 * L) / 451);
	var N = H + L - 7 * M + 114;
	var month = Math.floor(N / 31);
	var day = 1 + (N % 31);
	return getFormattedDate(year, month, day);
}

function nextDay(day, sum) {
	var date = new Date(day);
	var newDate = (sum === 7 ? date : new Date(date.getTime() + (((7 + sum) - date.getUTCDay()) % 7) * MILLISECONDS_DAY));
	return getFormattedDate(newDate.getUTCFullYear(), newDate.getUTCMonth() + 1, newDate.getUTCDate());
}

function addZero(number) {
	number = number.toString();
	if (number > 0 && number < 10 && !number.startsWith('0')) {
		return '0'.concat(number);
	} else {
		return number;
	}
}

function getFormattedDate(year, month, day) {
	return year.toString().concat('-').concat(addZero(month)).concat('-').concat(addZero(day));
}

/**
 * Verifica si una fecha específica es festivo en Colombia
 * @param {string|Date} date - Fecha a verificar (formato 'YYYY-MM-DD' o objeto Date)
 * @returns {Object} - { isHoliday: boolean, celebration?: string }
 */
function isHoliday(date) {
	try {
		// Convertir la fecha a string en formato YYYY-MM-DD
		var dateString;
		if (date instanceof Date) {
			dateString = getFormattedDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
		} else if (typeof date === 'string') {
			// Validar formato YYYY-MM-DD
			if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
				throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
			}
			dateString = date;
		} else {
			throw new Error('Tipo de fecha inválido. Use string (YYYY-MM-DD) o Date');
		}

		// Extraer el año de la fecha
		var year = parseInt(dateString.split('-')[0]);
		
		// Obtener todos los festivos del año
		var holidays = getColombiaHolidaysByYear(year);
		
		// Buscar si la fecha está en la lista de festivos
		var holidayFound = holidays.find(function(holiday) {
			return holiday.holiday === dateString;
		});

		if (holidayFound) {
			return {
				isHoliday: true,
				celebration: holidayFound.celebration
			};
		} else {
			return {
				isHoliday: false
			};
		}
	} catch (error) {
		throw new Error('Error al verificar festivo: ' + error.message);
	}
}

export { getColombiaHolidaysByYear, isHoliday, HOLIDAYS, EASTER_WEEK_HOLIDAYS };