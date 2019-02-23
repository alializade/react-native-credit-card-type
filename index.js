import React, { Component } from 'react';
import Functions from './src/functions';

var _FINAL_CREDIT_CARD_TYPES = Functions.getAllCardTypeKeysAsAnArray(),
    _FINAL_CUSTOM_CARDS = {};

const CreditCardType = {
  getTypeInfo: (type) => Functions.findType(type, _FINAL_CREDIT_CARD_TYPES),
  detectCreditCard: (cardNumber) => {
    var _INITIAL_CARD_TYPES = Functions.getAllCardTypes(),
        _CARD_TYPES = {};

    for (var cardType in _INITIAL_CARD_TYPES) {
      if (_FINAL_CREDIT_CARD_TYPES.includes(_INITIAL_CARD_TYPES[cardType])){
        _CARD_TYPES[_INITIAL_CARD_TYPES[cardType]] = Functions.findCard(_INITIAL_CARD_TYPES[cardType]);
      }
    }

    _CARD_TYPES = {
      ..._CARD_TYPES,
      ..._FINAL_CUSTOM_CARDS
    };

    return Functions.detectCreditCardType(cardNumber, _CARD_TYPES);
  },
  removeCard: (name) => {
    const _POSITION = Functions.getCardPosition(name);

    _FINAL_CREDIT_CARD_TYPES.splice(_POSITION, 1);
  },
  addCard: (config) => {
    var _EXISTING_CARD_POSITION = Functions.getCardPosition(config.type, true);

    _FINAL_CUSTOM_CARDS[config.type] = config;

    if (_EXISTING_CARD_POSITION === -1) {
      _FINAL_CREDIT_CARD_TYPES.push(config.type);
    }
  },
  updateCard: (cardType, updates) => {
    const _CARD_TYPES = Functions.getAllCardTypes(),
          _ORIGINAL_OBJECT = _FINAL_CUSTOM_CARDS[cardType] || _CARD_TYPES[cardType];

    var _CLONED_CARD;

    if (!_ORIGINAL_OBJECT) {
      throw new Error(`"${cardType}" is not a recognized type. Use \`addCard\` instead.`);
    }

    if (updates.type && _ORIGINAL_OBJECT.type !== updates.type) {
      throw new Error('Cannot overwrite type parameter.');
    }

    _CLONED_CARD = _ORIGINAL_OBJECT;

    Object.keys(_CLONED_CARD).forEach((key) => {
      if (updates[key]) {
        _CLONED_CARD[key] = updates[key];
      }
    });

    _FINAL_CUSTOM_CARDS[_CLONED_CARD.type] = _CLONED_CARD;
  },
  changeOrder: (name, position) => {
    const _CURRENT_POSITION = Functions.getCardPosition(name);

    _FINAL_CREDIT_CARD_TYPES.splice(_CURRENT_POSITION, 1);
    _FINAL_CREDIT_CARD_TYPES.splice(position, 0, name);
  },
  resetModifications: () => {
    _FINAL_CREDIT_CARD_TYPES = Functions.getAllCardTypeKeysAsAnArray();
    _FINAL_CUSTOM_CARDS = {};
  },
  types: Functions.getAllCardTypeKeys()
};

module.exports = CreditCardType;
