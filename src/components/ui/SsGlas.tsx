import { View } from 'react-native';

import { glasErsatz, glasSchwebt, type SsGlasProps } from './glas-typen';

/**
 * Eine Fläche, die auf iOS 26 aus echtem Glas ist — **das hier ist die
 * WEB-Fassung** (`SsGlas.native.tsx` daneben ist die für iOS).
 *
 * Sie zeichnet den Rückfall aus `glas-typen.ts`, also genau die helle Fläche, die
 * vor Phase 19e-2 überall stand. Ians Entscheidung 43: Der Browser bleibt schlicht.
 * `backdrop-filter: blur()` wäre hier machbar gewesen und ist verworfen — ein
 * nachgebautes Glas, das anders aussieht als das echte, ist zweimal Arbeit für
 * einen Unterschied, den niemand vergleichen kann.
 *
 * **Es gibt hier bewusst kein `expo-glass-effect`**, obwohl das Paket einen eigenen
 * Web-Rückfall mitbringt: Ein Import, der auf Web nichts tut, gehört nicht ins
 * Web-Bündel (harte Regel 52).
 */
export function SsGlas({ children, schwebt, style }: SsGlasProps) {
  return <View style={[glasErsatz, schwebt && glasSchwebt, style]}>{children}</View>;
}
