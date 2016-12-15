$(function() {
	// New lines
	var form = $('.js-form'),
		lineCntrls = $('.js-line'),
		formEmptyFields = $('.js-form-fields'),
		lineBlock = $('.js-line-block'),
		lineTemplate = $('#line-block').template(),
		errorBlock = $('.error-info'),
		errorModal = $('#error'),
		backCntrl = $('.js-date_back'),
		datesRow = form.find('.js-date_row'),
		oneWayCntrl = form.find('.js-one_way'),
		successModal = $('#success'),
		isTimeout,
		modalTimeout,
		isExtendedForm,
		animSpeed = 300,
		lineCount = 1,

	setErrorField = function(fieldName) {
		form
			.find('input[name=' + fieldName + ']')
			.addClass('error');
	},

	setError = function(msg, isSuccess) {		if (isSuccess) {			window.location.href = "/thanks.html";		}	
		if (msg) {
			var modal = !isSuccess ? errorModal : successModal;
			modal
				.find('.error-msg')
				.text(msg);
			modal.modal('show');

			/*errorBlock
			 .text(msg)
			 .toggleClass('hidden', !msg)
			 .removeClass('success');*/
		}
	},

	toObject = function(data) {
		var returnData = {};

		if (data) {
			if (data.push && data.length) {
				$(data).each(function(i, item) {
					var itemData = returnData[item.name];

					if (itemData) {
						if (!itemData.push) {
							returnData[item.name] = [itemData];
						}
						returnData[item.name].push(item.value);
					} else {
						returnData[item.name] = item.value;
					}
				});
			} else {
				returnData = data;
			}
		}
		return returnData;
	},

	initDatepicker = function() {
		$('.js-date').datepicker({
			regional: 'en',
			showAnim: 'fadeIn',
			dateFormat: 'dd.mm.yy',
			minDate: 0
		});

		$('.js-date-cntrl')
			.unbind('click.date')
			.bind('click.date', function(e) {
				$(e.currentTarget)
					.siblings('.js-date')
					.focus();
			});
	},

	rebuildLines = function() {
		var lines = form.find('.js-line-container'),
			rebCount = 2;

		if (lines.length) {
			for (var i = 0, length = lines.length; i < length; i++) {
				var line = lines.eq(i),
					inputs = line.find('.js-line-input');

				for (var j = 0, l = inputs.length; j < l; j++) {
					var input = inputs.eq(j),
						name = input.attr('name').split('_')[0];

					input.attr('name', name + '_' + rebCount);
				}

				line
					.find('.js-line-label')
					.text('Destination #' + rebCount + ':');

				rebCount++;
			}
		} else {
			$('.js-line-back-cntrl').show();
		}

		$('.moreflights-add').show();

	},

	initDelLine = function() {
		$('.js-line-del')
			.unbind('click.del')
			.bind('click.del', function() {
				var cntrl = $(this),
					line = cntrl.closest('.js-line-container');

				line.
					fadeOut(animSpeed, function() {
						lineCount--;
						line.remove();
						rebuildLines();
					});

				return false;
			});
	},

	// Удаляет все линии
	delLines = function() {
		var lines = form.find('.js-line-container');

		lines.fadeOut(animSpeed, function() {
			lines.remove();
		});
		lineCount = 1;
	},

	validateLine = function() {
		var data = form.serializeArray(),
			msg = '',
			isValid = true;

		// Clear all
		$('.error').removeClass('error');

		// Validate
		for (var item in data) {
			if (data.hasOwnProperty(item)) {
				switch (data[item].name) {
					case 'From_1':
					case 'From_2':
					case 'From_3':
					case 'From_4':
					case 'When_1':
					case 'When_2':
					case 'When_3':
					case 'When_4':
					case 'Where_1':
					case 'Where_2':
					case 'Where_3':
					case 'Where_4':
						if (!data[item].value) {
							!msg && (msg = 'Fill in all required entry fields');
							isValid = false;
							setErrorField(data[item].name);
						}

						break;
				}
			}
		}

//		setError(msg);

		return isValid;
	},

	initClear = function() {
		// Clear input
		form
			.find('input')
			.unbind('focus.clear')
			.bind('focus.clear', function() {
				$(this).removeClass('error');
			});
	},

	toggleBack = function(isShow) {
		isShow = typeof isShow == 'boolean' ? isShow : !oneWayCntrl.is(':checked');
		backCntrl.toggle(isShow);

		if (isShow) {
			datesRow.append(backCntrl);
		} else {
			formEmptyFields.append(backCntrl);
		}
	},

	addLine = function(type) {
//		if (validateLine()) {
			lineCount++;

			var isBack = type == 'back',
				clone = $.tmpl(lineTemplate, {
					Title: isBack ? 'Returning' : 'Destination #' + lineCount + ':',
					Count: lineCount
				});

			clone
				.appendTo(lineBlock)
				.hide()
				.fadeIn(animSpeed);

			/*// Back
			if (isBack) {
				$('input[name=Where_' + lineCount + ']')
					.val($('.js-line-first').val())
					.hide();
			}*/

			initDatepicker();
			initClear();
			initDelLine();

			// Hide cntrls
			/*if (lineCount == 4 || isBack) {
				$('.moreflights-add').hide();
			} else if (!isBack) {
				$('.js-line-back-cntrl').hide();
			}*/
//		}
	};

	initDatepicker();
	initClear();

	// Modal
	$('#offert').modal({
		show: false
	});

	/*lineCntrls.bind('click.line', function(e) {
		e.preventDefault();

		var cntrl = $(e.currentTarget),
			type = cntrl.data('type');

		addLine(type);
	});*/

	// Radio
	var radioCntrls = $('.js-radio');

	if (radioCntrls.length) {
		var setActive = function(set) {
			var set = set || radioCntrls,
				actInputs = set.find('.js-radio-input:checked');

			actInputs
				.closest('.js-radio')
				.addClass('active')
				.siblings('.js-radio')
				.removeClass('active');
		};

		// Init cntrls
		setActive();

		radioCntrls
			.find('.js-radio-input')
			.bind('change.radio', function(e) {
				var set = $(e.currentTarget).closest('.flightform-radio');

				setActive(set);
			});
	}

	// One Way
	oneWayCntrl.bind('change.toggle_back', toggleBack);

	//Add Lines
	$('.js-change_type').bind('click', function(event) {
		var cntrl = $(this),
			flySettingsBlock = form.find('.js-fly_settings'),
			infoContainer = form.find('.js-info_container'),
			oneWayContainer = form.find('.js-one_way_container');

		isExtendedForm = !isExtendedForm;
		cntrl.text((isExtendedForm ? 'Single Destination' : 'Multiple Destinations'));

		if (isExtendedForm) {
			while (lineCount < 4) {
				addLine();
			}
			flySettingsBlock.prependTo(infoContainer);
			toggleBack(false);
		} else {
			delLines();
			flySettingsBlock.appendTo(lineBlock);
			toggleBack();
		}

		oneWayContainer.toggle(!isExtendedForm);

		return false;
	});

	// Submit
	form.bind('submit', function(e) {
		e.preventDefault();

		var data = $(this).serializeArray(),
			dataObj = toObject(data),
			msg = '',
			isValid = true;

//		console.log(data, dataObj);
		// Clear all
		$('.error').removeClass('error');

		// Validate
		for (var item in data) {
			if (data.hasOwnProperty(item)) {
				switch (data[item].name) {
					case 'Name':
					case 'From_1':
					case 'From_2':
					case 'From_3':
					case 'From_4':
					case 'When_1':
					case 'When_2':
					case 'When_3':
					case 'When_4':
					case 'Where_1':
					case 'Where_2':
					case 'Where_3':
					case 'Where_4':
						if (!data[item].value) {
							!msg && (msg = 'Fill in all required entry fields');
							isValid = false;
							setErrorField(data[item].name);
						}

						break;
					case 'Email':
						var regEmail = /[0-9a-z_]+@[0-9a-z_^.]+\.[a-z]{2,3}/i;

						if (!regEmail.test(data[item].value)) {
							!msg && (msg = 'Enter a valid email address');
							isValid = false;
							setErrorField(data[item].name);
						}

	 					break;
				}
			}
		}

		// Check accept
		if (!dataObj.AcceptInfo) {
			!msg && (msg = 'Please accept the offer terms');
			isValid = false;
			setErrorField('AcceptInfo');
		}

		// Check timeout (spam)
		if (isTimeout) {
			!msg && (msg = 'You have already sent a request. Please wait.');
		}

		setError(msg);

		// Send
		if (isValid && !isTimeout) {
			var message = '<b>Имя отправителя:</b> ' + dataObj.Name + '<br>'
				+ '<b>Email отправителя:</b> ' + dataObj.Email + '<br>'
				+ '<b>Телефон отправителя:</b> ' + dataObj.Phone + '<br>'
				+ (dataObj.Promo ? '<b>Промо-код:</b> ' + dataObj.Promo + '<br>' : '')
				+ '<b>Пункт отправления:</b> ' + dataObj.From_1 + '<br>'
				+ '<b>Время отправления #1:</b> ' + dataObj.When_1 + '<br>' + '<b>Пункт назначения #1:</b> ' + dataObj.Where_1 + '<br>'
				+ (dataObj.When_2 ? '<b>Время ' + (dataObj.From_2 ? 'отправления #2' : 'возвращения') + ':</b> ' + dataObj.When_2 + '<br>' + (dataObj.From_2 ? '<b>Пункт отправления #2:</b> ' + dataObj.From_2 + '<br>' + '<b>Пункт назначения #2:</b> ' + dataObj.Where_2 + '<br>' : '') : '')
				+ (dataObj.When_3 ? '<b>Время отправления #3:</b> ' + dataObj.When_3 + '<br>' + '<b>Пункт отправления #3:</b> ' + dataObj.From_3 + '<br>' + '<b>Пункт назначения #3:</b> ' + dataObj.Where_3 + '<br>' : '')
				+ (dataObj.When_4 ? '<b>Время отправления #4:</b> ' + dataObj.When_4 + '<br>' + '<b>Пункт отправления #4:</b> ' + dataObj.From_4 + '<br>'  + '<b>Пункт назначения #4:</b> ' + dataObj.Where_4 + '<br>' : '')
				+ '<b>Класс обслуживания:</b> ' + dataObj.ServiceClass + '<br>'
				+ '<b>Взрослые:</b> ' + dataObj.AdultCount + '<br>'
				+ '<b>Дети до 12 лет:</b> ' + dataObj.KidsCount + '<br>'
				+ (dataObj.OneWay ? '<b>В одну сторону:</b> ' + dataObj.OneWay + '<br>' : '')
				+ (dataObj.AddInfo ? '<b>Дополнительно:</b> ' + ($.isArray(dataObj.AddInfo) ? dataObj.AddInfo.join(', ') : dataObj.AddInfo) : '');

//			console.log(message);
			$.getJSON(
				'script/feedback.php',
				{
					email: dataObj.Email,
					message: message
				},
				function(result){
					// Callback
					setError(result.message, result.status);
					/*errorBlock
						.text(result.message)
						.removeClass('hidden')
						.toggleClass('success', result.status);*/
				}
			);

			// Set timeout after sending - 1 min
			isTimeout = true;
			setTimeout(function() {
				isTimeout = false;
			}, 60000);
		}
	});
});

function getRelatedIataSuggestionInput(element) {
    return element.siblings("[type=hidden]");
}

function initializeWayContainer(link) {
    console.log('123');
    console.log(link);
    $iataInputs = $(link).find(".iata-suggestion");

    $iataInputs.on("keypress", function() {
        getRelatedIataSuggestionInput($(this)).val("");
    });

    $iataInputs.autocomplete({
     
      source : "search.php",      
     
        minChars : 3,
        select: function(event, ui) {
            event.preventDefault();

            jQuery(this).val(ui.item.label);
            getRelatedIataSuggestionInput(jQuery(this)).val(ui.item.value);
        }
    });

    