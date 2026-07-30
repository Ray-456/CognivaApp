import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

// Central icon registry. When the real designed icons are ready, just drop
// the finished PNGs/SVGs into assets/icons/ with these exact filenames —
// nothing else in the app needs to change.
const ICONS = {
  home: require('../../assets/icons/icon-home.png'),
  community: require('../../assets/icons/icon-community.png'),
  book: require('../../assets/icons/icon-book.png'),
  lightning: require('../../assets/icons/icon-lightning.png'),
  chart: require('../../assets/icons/icon-chart.png'),
  chat: require('../../assets/icons/icon-chat.png'),
  gear: require('../../assets/icons/icon-gear.png'),
  heartOutline: require('../../assets/icons/icon-heart-outline.png'),
  heartFilled: require('../../assets/icons/icon-heart-filled.png'),
  comment: require('../../assets/icons/icon-comment.png'),
  camera: require('../../assets/icons/icon-camera.png'),
  video: require('../../assets/icons/icon-video.png'),
  add: require('../../assets/icons/icon-add.png'),
  back: require('../../assets/icons/icon-back.png'),
  search: require('../../assets/icons/icon-search.png'),
  pencil: require('../../assets/icons/icon-pencil.png'),
} as const;

export type IconName = keyof typeof ICONS;

export default function Icon({
  name,
  size = 22,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size }, color ? { tintColor: color } : null, style]}
      resizeMode="contain"
    />
  );
}
