export interface IDictionary<T> {
  [key: string]: T;
}

export type HotKeyEvent = React.KeyboardEvent<HTMLDivElement>;

export type EventHandler = (e: HotKeyEvent) => void;
export type HandlerDictionary = IDictionary<EventHandler>;
export type ParsedHandler = { parsedMatcher: number[]; handler: EventHandler };

export interface IProps {
  handlers: HandlerDictionary;
  enabled: boolean;
  ttl?: number;
  onBlur?: () => void;
}

export interface IMatcherCatalog {
  konami: ParsedHandler[];
  combination: ParsedHandler[];
}
