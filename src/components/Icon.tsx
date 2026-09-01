import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { MsIconDefinition } from 'material-symbols-react-native';
import { msAdd } from '@material-symbols-react-native/outlined-400/msAdd';
import { msAnalytics } from '@material-symbols-react-native/outlined-400/msAnalytics';
import { msArrowBack } from '@material-symbols-react-native/outlined-400/msArrowBack';
import { msBolt } from '@material-symbols-react-native/outlined-400/msBolt';
import { msCamera } from '@material-symbols-react-native/outlined-400/msCamera';
import { msChat } from '@material-symbols-react-native/outlined-400/msChat';
import { msComment } from '@material-symbols-react-native/outlined-400/msComment';
import { msEdit } from '@material-symbols-react-native/outlined-400/msEdit';
import { msFavorite } from '@material-symbols-react-native/outlined-400/msFavorite';
import { msFavoriteFill } from '@material-symbols-react-native/outlined-400/msFavoriteFill';
import { msGroups } from '@material-symbols-react-native/outlined-400/msGroups';
import { msMenuBook } from '@material-symbols-react-native/outlined-400/msMenuBook';
import { msHome } from '@material-symbols-react-native/outlined-400/msHome';
import { msSearch } from '@material-symbols-react-native/outlined-400/msSearch';
import { msSettings } from '@material-symbols-react-native/outlined-400/msSettings';
import { msVideocam } from '@material-symbols-react-native/outlined-400/msVideocam';
import { msArrowForward } from '@material-symbols-react-native/outlined-400/msArrowForward';
import { msCheck } from '@material-symbols-react-native/outlined-400/msCheck';
import { msClose } from '@material-symbols-react-native/outlined-400/msClose';
import { msDelete } from '@material-symbols-react-native/outlined-400/msDelete';
import { msMenu } from '@material-symbols-react-native/outlined-400/msMenu';
import { msMoreVert } from '@material-symbols-react-native/outlined-400/msMoreVert';
import { msNotifications } from '@material-symbols-react-native/outlined-400/msNotifications';
import { msPerson } from '@material-symbols-react-native/outlined-400/msPerson';
import { msAdd as msAddRounded } from '@material-symbols-react-native/rounded-400/msAdd';
import { msHome as msHomeRounded } from '@material-symbols-react-native/rounded-400/msHome';
import { msSettings as msSettingsRounded } from '@material-symbols-react-native/rounded-400/msSettings';
import { msAdd as msAddSharp } from '@material-symbols-react-native/sharp-400/msAdd';

export type IconName =
  | 'home' | 'community' | 'book' | 'lightning' | 'chart' | 'chat' | 'gear'
  | 'heartOutline' | 'heartFilled' | 'comment' | 'camera' | 'video' | 'add'
  | 'back' | 'search' | 'pencil' | 'settings' | 'favorite' | 'menu'
  | 'arrow_back' | 'arrow_forward' | 'close' | 'delete' | 'edit'
  | 'notifications' | 'person' | 'check' | 'more_vert';

export type MaterialSymbolWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type MaterialSymbolStyle = 'outlined' | 'rounded' | 'sharp';

type SymbolModule = Record<string, MsIconDefinition>;

const SYMBOLS: Record<IconName, string> = {
  home: 'Home',
  community: 'Groups',
  book: 'MenuBook',
  lightning: 'Bolt',
  chart: 'Analytics',
  chat: 'Chat',
  gear: 'Settings',
  heartOutline: 'Favorite',
  heartFilled: 'Favorite',
  comment: 'Comment',
  camera: 'Camera',
  video: 'Videocam',
  add: 'Add',
  back: 'ArrowBack',
  search: 'Search',
  pencil: 'Edit',
  settings: 'Settings',
  favorite: 'Favorite',
  menu: 'Menu',
  arrow_back: 'ArrowBack',
  arrow_forward: 'ArrowForward',
  close: 'Close',
  delete: 'Delete',
  edit: 'Edit',
  notifications: 'Notifications',
  person: 'Person',
  check: 'Check',
  more_vert: 'MoreVert',
};

const BASE_SYMBOLS: Record<string, MsIconDefinition> = {
  Add: msAdd, Analytics: msAnalytics, ArrowBack: msArrowBack, Bolt: msBolt,
  Camera: msCamera, Chat: msChat, Comment: msComment, Edit: msEdit,
  Favorite: msFavorite, Groups: msGroups, MenuBook: msMenuBook, Home: msHome,
  Search: msSearch, Settings: msSettings, Videocam: msVideocam,
  ArrowForward: msArrowForward, Check: msCheck, Close: msClose, Delete: msDelete,
  Menu: msMenu, MoreVert: msMoreVert, Notifications: msNotifications, Person: msPerson,
};

const FILLED_SYMBOLS: Record<string, MsIconDefinition> = { Favorite: msFavoriteFill };
const WEIGHT_MODULES: Record<MaterialSymbolWeight, SymbolModule> = {
  100: BASE_SYMBOLS, 200: BASE_SYMBOLS, 300: BASE_SYMBOLS, 400: BASE_SYMBOLS,
  500: BASE_SYMBOLS, 600: BASE_SYMBOLS, 700: BASE_SYMBOLS,
};
const ROUNDED_SYMBOLS: SymbolModule = { Add: msAddRounded, Home: msHomeRounded, Settings: msSettingsRounded };
const SHARP_SYMBOLS: SymbolModule = { Add: msAddSharp };

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: MaterialSymbolWeight;
  fill?: boolean | 0 | 1;
  grade?: -25 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
  style?: StyleProp<ViewStyle> | MaterialSymbolStyle;
};

export default function Icon({
  name,
  size = 23,
  color,
  weight = 400,
  fill = false,
  grade: _grade,
  opticalSize: _opticalSize,
  style,
}: IconProps) {
  const symbolStyle: MaterialSymbolStyle = style === 'rounded' || style === 'sharp' ? style : 'outlined';
  const layoutStyle = typeof style === 'string' ? undefined : style;
  const isFilled = fill === true || fill === 1 || name === 'heartFilled';
  const defaultDefinition = isFilled ? FILLED_SYMBOLS[SYMBOLS[name]] : BASE_SYMBOLS[SYMBOLS[name]];
  const definition = symbolStyle === 'rounded'
    ? ROUNDED_SYMBOLS[SYMBOLS[name]] ?? defaultDefinition
    : symbolStyle === 'sharp'
      ? SHARP_SYMBOLS[SYMBOLS[name]] ?? defaultDefinition
      : WEIGHT_MODULES[weight][SYMBOLS[name]] ?? defaultDefinition;

  // On web platforms, render SVG directly since react-native-svg's SvgXml is unavailable
  if (typeof document !== 'undefined') {
    const svgWithFill = definition.xml
      .replace(/<path /g, `<path fill="${color ?? '#000000'}" `)
      .replace(/<svg/, `<svg style="width: 100%; height: 100%; object-fit: contain;" preserveAspectRatio="xMidYMid meet"`);
    return React.createElement('div', {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...(typeof layoutStyle === 'object' && layoutStyle ? layoutStyle : {}),
      },
      dangerouslySetInnerHTML: { __html: svgWithFill },
    });
  }

  // Native fallback: render empty View (should not reach on web)
  return <View style={layoutStyle} />;
}
