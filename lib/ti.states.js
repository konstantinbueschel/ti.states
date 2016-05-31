var LTAG = '[Ti.States]';


/**
 * Run animations easily, just with tss files
 *
 * @author Mohamed Shaban <mohamed.shaban@codly.io>
 *
 * @public
 * @constructor
 * @param {Alloy.Controller} controller
 * @returns {Ti.States}
 */
module.exports = function (controller) {

	// variable declaration
	var Promise       = require('/vendor/q'),
		_             = require('/alloy/underscore'),

		_currentState = null,
		_path         = ('/alloy/styles/' + controller.__controllerPath),
		_styles       = require(_path);


	/**
	 * Run animation function
	 *
	 * @public
	 * @param {String} state
	 * @param {Dictionary} [animationOptions]
	 * @param {Boolean} [shouldAnimate=true]
	 * @returns {Promise}
	 */
	this.changeToState = function (state, animationOptions, shouldAnimate) {

		var deferred = Promise.defer(),
			stateStyles;


		if (state !== _currentState) {

			shouldAnimate = _.isUndefined(shouldAnimate) || !!shouldAnimate;
			_currentState = state;


			stateStyles = _.filter(_styles, function (style) {

				return (style.key && style.key.indexOf(':' + state) > 0);
			});


			_.each(stateStyles, function (stateTSS, index, collection) {

				var id      = stateTSS.key.replace(':' + state, ''),
					view    = controller.getView(id.replace('#')),
					viewTSS = stateTSS.style,

					animationArgs;


				if (view) {

					if (shouldAnimate) {

						animationArgs = _.extend({}, viewTSS, animationOptions);


						// handle Alloy controller respectively views added by xml
						if (!view.apiName && view.getViewEx) {

							view = view.getViewEx({

								recurse: true
							});
						}


						Ti.API.debug(LTAG, 'Trying to animate view [', view.apiName, '#', id, ']');


						if (index === (collection.length - 1)) {

							view.animate(animationArgs, function _afterAnimation() {

								deferred.resolve(_currentState);

								return;
							});
						}
						else {

							view.animate(animationArgs);
						}
					}
					else {

						Ti.API.debug(LTAG, 'Just applying styles without animation to view [', view.apiName, '#', id, ']');

						view.applyProperties(viewTSS);
					}
				}

				return;
			});
		}
		else {

			Ti.API.warn(LTAG, 'Aborting current and state to change to, are the same! [', _currentState, '==', state, ']');

			deferred.resolve(_currentState);
		}


		return deferred.promise;

	}; // END changeToState()


	/**
	 * Alias for changeToState
	 *
	 * @public
	 * @see changeToState
	 * @returns void
	 */
	this.changeState = this.changeToState;


	/**
	 * Returns last respectively current state
	 *
	 * @public
	 * @returns {String} currentState
	 */
	this.getLastState = function () {

		return _currentState;

	}; // END getLastState()


	/**
	 * Init to state without animation
	 *
	 * @public
	 * @param {String} state
	 * @returns {Promise}
	 */
	this.init = function (state) {

		return this.changeState(state || '', null, false);

	}; // END init()


	return this;

}; // END module.exports()
