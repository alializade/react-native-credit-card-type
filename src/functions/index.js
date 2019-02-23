import Lodash from 'lodash';
import Datasets from '../datasets';

module.exports = {
  convertTokenToKeyword: (token) => {
    return token.replace(/(_|-| )+/ig, '-').toLowerCase();
  },
  convertTokenToKey: (token) => {
    return token.replace(/(_|-| )+/ig, '_').toUpperCase();
  },
  isValidInputType: (cardNumber) => {
    return typeof cardNumber === 'string' || cardNumber instanceof String;
  },
  getAllCardTypeKeys: () => {
    var _TYPES = {};

    for (var cardTypeItem in Datasets.CardTypes) {
      const _CARD_TYPE = Datasets.CardTypes[cardTypeItem].type;

      _TYPES[_CARD_TYPE] = _CARD_TYPE;
    }

    return _TYPES;
  },
  getAllCardTypeManipulatedKeys: (cardTypes) => {
    if (typeof cardTypes != 'undefined'){
      if (Array.isArray(cardTypes)){
        return Lodash.fromPairs(cardTypes.map((cardType) => {
          return [cardType, cardType];
        }));
      }else{
        return cardTypes;
      }
    }else{
      return module.exports.getAllCardTypeKeys();
    }
  },
  getAllCardTypeKeysAsAnArray: (cardTypes) => {
    if (typeof cardTypes != 'undefined'){
      return Object.values(module.exports.getAllCardTypeManipulatedKeys(cardTypes));
    }else{
      return Object.values(module.exports.getAllCardTypeManipulatedKeys());
    }
  },
  findType: (type, cardTypes) => {
    if (typeof type != 'undefined'){
      const _TYPE = module.exports.convertTokenToKeyword(type),
            _TYPES = module.exports.getAllCardTypeManipulatedKeys();

      return (typeof cardTypes != 'undefined')? cardTypes[type]: (_TYPES[type] || Datasets.CardTypes[type]);
    }else{
      throw new Error("You should define the type of credit card.");
    }
  },
  findCard: (type, cardTypes) => {
    if (typeof type != 'undefined'){
      const _TYPE = module.exports.convertTokenToKeyword(type);

      return (typeof cardTypes != 'undefined')? cardTypes[type]: Datasets.CardTypes[type];
    }else{
      throw new Error("You should define the type of credit card.");
    }
  },
  getAllCardTypes: () => {
    const _TYPES = module.exports.getAllCardTypeKeysAsAnArray();

    return _TYPES.map((type) => {
      return type
      return module.exports.findType(type, _TYPES);
    });
  },
  getCardPosition: (name, ignoreErrorForNotExisting) => {
    if (typeof name != 'undefined'){
      const _TYPES = module.exports.getAllCardTypeKeysAsAnArray(),
            _NAME = module.exports.convertTokenToKeyword(name),
            _POSITION = _TYPES.indexOf(_NAME);

      if (!ignoreErrorForNotExisting && _POSITION === -1) {
        throw new Error(`"${name}" is not a supported card type.`);
      }

      return _POSITION;
    }else{
      throw new Error("You should define the name of your desired credit card.");
    }
  },
  hasEnoughResultsToDetermineBestMatch: (results) => {
    const NUMBER_OF_RESULTS_WITH_MAX_STRENGTH_PROPERTY = results.filter((result) => {
      return result.matchStrength;
    }).length;

    // if all possible results have a maxStrength property
    // that means the card number is sufficiently long
    // enough to determine conclusively what the type is
    return ((NUMBER_OF_RESULTS_WITH_MAX_STRENGTH_PROPERTY > 0) && (NUMBER_OF_RESULTS_WITH_MAX_STRENGTH_PROPERTY === results.length));
  },
  findBestMatch: (results) => {
    if (!module.exports.hasEnoughResultsToDetermineBestMatch(results)) {
      return;
    }

    return results.reduce((bestMatch, result) => {
      if (!bestMatch) {
        return result;
      }

      // if the current best match pattern is less specific
      // than this result, set the result as the new best match
      if (bestMatch.matchStrength < result.matchStrength) {
        return result;
      }

      return bestMatch;
    });
  },
  matchesRange: (cardNumber, min, max) => {
    const _MAX_LENGTH_TO_CHECK = String(min).length,
          _SUBSTR = cardNumber.substr(0, _MAX_LENGTH_TO_CHECK),
          _INTEGER_REPRESENTATION_OF_CARD_NUMBER = parseInt(_SUBSTR, 10);

    min = parseInt(String(min).substr(0, _SUBSTR.length), 10);
    max = parseInt(String(max).substr(0, _SUBSTR.length), 10);

    return ((_INTEGER_REPRESENTATION_OF_CARD_NUMBER >= min) && (_INTEGER_REPRESENTATION_OF_CARD_NUMBER <= max));
  },
  matchesPattern: (cardNumber, pattern) => {
    pattern = String(pattern);

    return (pattern.substring(0, cardNumber.length) === cardNumber.substring(0, pattern.length));
  },
  matches: (cardNumber, pattern) => {
    if (Array.isArray(pattern)) {
      return module.exports.matchesRange(cardNumber, pattern[0], pattern[1]);
    }

    return module.exports.matchesPattern(cardNumber, pattern);
  },
  addMatchingCardsToResults: (cardNumber, cardConfiguration, results) => {
    var _PATTERN, _PATTERN_LENGTH;

    for (var i = 0; i < cardConfiguration.patterns.length; i++) {
      _PATTERN = cardConfiguration.patterns[i];

      if (!module.exports.matches(cardNumber, _PATTERN)) {
        continue;
      }

      if (Array.isArray(_PATTERN)) {
        _PATTERN_LENGTH = String(_PATTERN[0]).length;
      } else {
        _PATTERN_LENGTH = String(_PATTERN).length;
      }

      if (cardNumber.length >= _PATTERN_LENGTH) {
        cardConfiguration.matchStrength = _PATTERN_LENGTH;
      }

      results.push(cardConfiguration);
      break;
    }
  },
  detectCreditCardType: (cardNumber, testOrder) => {
    var _TEST_ORDER = testOrder || Datasets.CardTypes,
        _BEST_MATCH,
        _RESULTS = [];

    const _TYPES = module.exports.getAllCardTypeKeysAsAnArray(_TEST_ORDER);

    if (!module.exports.isValidInputType(cardNumber)) {
      return [];
    }

    if (cardNumber.length === 0) {
      return module.exports.getAllCardTypes();
    }

    _TYPES.forEach(function (cardType) {
      const _TYPE = cardType.type,
            _CARD_CONFIGURATION = module.exports.findType(_TYPE, _TEST_ORDER);

      module.exports.addMatchingCardsToResults(cardNumber, _CARD_CONFIGURATION, _RESULTS);
    });

    _BEST_MATCH = module.exports.findBestMatch(_RESULTS);

    if (_BEST_MATCH) {
      return [_BEST_MATCH];
    }

    return _RESULTS;
  }
};
