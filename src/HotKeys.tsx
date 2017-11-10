import * as React from 'react';
import { IProps, IMatcherCatalog, IDictionary, HandlerDictionary, HotKeyEvent, ParsedHandler } from './types';

class HotKeys extends React.PureComponent<IProps> {
  private matcherCatalog: IMatcherCatalog = { konami: [], combination: [] };
  private keyStash: number[] = [];
  private lastEventTimestamp: number = 0;
  private konamiEnabled: boolean = false;
  private keyCodes = {
    esc: 27,
    escape: 27,
    ctrl: 17,
    control: 17,
    cmd: 91,
    command: 91,
    alt: 18,
    shift: 16,
    return: 13,
    enter: 13,
    left: 37,
    arrowleft: 37,
    up: 38,
    arrowup: 38,
    right: 39,
    arrowright: 39,
    down: 40,
    arrowdown: 40
  };

  static defaultProps: Partial<IProps> = {
    ttl: 1000
  };

  componentDidMount() {
    this.initializeHandlers(this.props.handlers);
  }
  componentWillUpdate(props: IProps) {
    this.initializeHandlers(props.handlers);
  }

  initializeHandlers = (handlers: HandlerDictionary) => {
    this.matcherCatalog = Object.keys(handlers).reduce(this.parseHandlers(handlers), { konami: [], combination: [] });
    this.konamiEnabled = !!this.matcherCatalog.konami.length;
  };

  parseHandlers = (handlers: HandlerDictionary) => (catalog: IMatcherCatalog, matcher: string) => {
    const result = this.parseMatcher(matcher);
    if (result.type === 'void') return catalog;
    return {
      ...catalog,
      [result.type]: [
        ...catalog[result.type],
        {
          parsedMatcher: result.keys,
          handler: handlers[matcher]
        }
      ]
    };
  };

  handleKeyDown = (e: HotKeyEvent) => {
    if (!this.props.enabled) return;

    if (this.konamiEnabled) {
      this.handleKonami(e);
    }

    this.handleCombination(e);
    e.stopPropagation();
  };

  combinationShouldBeHandled = (combination: ParsedHandler, event: HotKeyEvent): boolean => {
    const map = {
      [this.keyCodes.shift]: 'shiftKey',
      [this.keyCodes.control]: 'ctrlKey',
      [this.keyCodes.alt]: 'altKey',
      [this.keyCodes.command]: 'metaKey'
    };

    for (let i = 0; i < combination.parsedMatcher.length; i++) {
      const keyCode = combination.parsedMatcher[i];
      const modifier = map[keyCode];
      const eventKeyCode = this.getCharCode(event.key.toLowerCase());

      if (modifier && !event[modifier]) {
        return false;
      }

      if (!modifier && eventKeyCode !== keyCode) {
        return false;
      }
    }

    return true;
  };

  konamiShouldBeHandled = (konami: ParsedHandler) => {
    const juan = konami.parsedMatcher;
    const agus = this.keyStash;

    if (juan.length > agus.length) {
      return false;
    }

    for (let i = 1; i <= juan.length; i++) {
      if (juan[juan.length - i] !== agus[agus.length - i]) return false;
    }

    return true;
  };

  handleKonami = (event: HotKeyEvent) => {
    const konamis = this.matcherCatalog.konami;
    const eventKeyCode = this.getCharCode(event.key.toLowerCase());
    if (this.lastEventTimestamp + this.props.ttl < Date.now()) {
      this.keyStash = [];
    }
    this.keyStash.push(eventKeyCode);
    this.lastEventTimestamp = Date.now();
    konamis.forEach(konami => {
      console.log(konami, this.keyStash);
      if (this.konamiShouldBeHandled(konami)) {
        konami.handler(event);
      }
    });
  };

  handleCombination = (e: HotKeyEvent) => {
    const combinations = this.matcherCatalog.combination;
    combinations.forEach(combination => {
      if (this.combinationShouldBeHandled(combination, e)) {
        combination.handler(e);
      }
    });
  };

  createMatcherResult = (type: string, keys: number[] = []) => {
    return {
      type,
      keys
    };
  };

  getCharCode = (key: string) => {
    return this.keyCodes[key] || key.charCodeAt(0);
  };

  parseMatcher = (matcher: string): { keys: number[]; type: string } => {
    if (typeof matcher !== 'string') {
      return this.createMatcherResult('void');
    }

    const trimmedMatcher = matcher.toLowerCase().trim();

    if (trimmedMatcher.length === 0) {
      return this.createMatcherResult('void');
    }

    if (trimmedMatcher === '*') {
      return this.createMatcherResult('combination', [-1]);
    }

    const combinations = trimmedMatcher.split('+');
    if (combinations.length > 1) {
      return this.createMatcherResult('combination', combinations.map(this.getCharCode));
    }

    const konami = trimmedMatcher.split(' ');
    if (konami.length > 1) {
      return this.createMatcherResult('konami', konami.map(this.getCharCode));
    }

    return this.createMatcherResult('combination', [this.getCharCode(trimmedMatcher)]);
  };

  handleBlur = () => {
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }
  
  handleRef = (element) => {    
    element.focus();
  }

  render() {
    const { className = '', style = {}, children } = this.props;
    return (
      <div className={className} tabIndex={0} onKeyDown={this.handleKeyDown} style={{ outline: 'none', ...style }} onBlur={this.handleBlur} ref={this.handleRef}>
        {children}
      </div>
    );
  }
}

export default HotKeys;
