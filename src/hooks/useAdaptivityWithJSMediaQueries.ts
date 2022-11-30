import * as React from "react";
import {
  canUseDOM,
  hasMouse as hasMouseLib,
  hasHover as hasHoverLib,
} from "@vkontakte/vkjs";
import {
  AdaptivityContext,
  type AdaptivityProps as BaseAdaptivityProps,
} from "../components/AdaptivityProvider/AdaptivityContext";
import { getOrDefault } from "../helpers/getOrDefault";
import {
  getViewWidthByMediaQueries,
  getViewHeightByMediaQueries,
  getSizeX,
  getSizeY,
  tryToCheckIsDesktop,
} from "../lib/adaptivity";
import { useMediaQueries } from "./useMediaQueries";
import { usePlatform } from "./usePlatform";

export interface UseAdaptivityWithJSMediaQueries
  extends Required<BaseAdaptivityProps> {
  isDesktop: boolean;
}

/**
 * Высчитывает и возвращает параметры адаптивности при изменении вьюпорта.
 *
 * Берёт в приоритет значения из `AdaptivityContext`.
 *
 * > ⚠ SSR
 * >
 * > Во избежания ошибок при гидрации, не используйте данный хук, если есть вероятность, что компонент будет отрендерен
 * > на стороне сервера.
 * >
 * > Лучше всего использовать для всплывающих окон, т.к. они вызываются только после загрузки
 * > страницы либо пользователем, либо программно.
 */
export const useAdaptivityWithJSMediaQueries =
  (): UseAdaptivityWithJSMediaQueries => {
    if (!canUseDOM) {
      console.error(`[useAdaptivityWithJSMediaQueries] Похоже вы пытаетесь использовать хук вне браузера.

Во избежание ошибок при гидрации, рекомендуется избегать этого, т.к. при SSR нет информации о размерах экрана.

Используйте CSS Media Query или библиотеку по типу https://github.com/artsy/fresnel.`);
    }

    const {
      viewWidth: viewWidthContext,
      viewHeight: viewHeightContext,
      sizeX: sizeXContext,
      sizeY: sizeYContext,
      hasMouse: hasMouseContext,
      hasHover: hasHoverContext,
    } = React.useContext(AdaptivityContext);

    const platform = usePlatform();
    const mediaQueries = useMediaQueries();

    const [[viewWidthLocal, viewHeightLocal], setViewSizeLocal] =
      React.useState(() => [
        getOrDefault(
          viewWidthContext,
          getViewWidthByMediaQueries(mediaQueries)
        ),
        getOrDefault(
          viewHeightContext,
          getViewHeightByMediaQueries(mediaQueries)
        ),
      ]);

    const adaptivityProps = React.useMemo(() => {
      const hasMouse = getOrDefault(hasMouseContext, hasMouseLib);
      const hasHover = getOrDefault(hasHoverContext, hasHoverLib);
      const viewWidth = getOrDefault(viewWidthContext, viewWidthLocal);
      const viewHeight = getOrDefault(viewHeightContext, viewHeightLocal);
      const sizeX = getOrDefault(sizeXContext, getSizeX(viewWidth));
      const sizeY = getOrDefault(
        sizeYContext,
        getSizeY(viewWidth, viewHeight, hasMouse)
      );
      const isDesktop = tryToCheckIsDesktop(
        viewWidth,
        viewHeight,
        hasMouse,
        platform
      );

      return {
        viewWidth,
        viewHeight,
        sizeX,
        sizeY,
        hasMouse,
        hasHover,
        isDesktop,
      };
    }, [
      viewWidthLocal,
      viewHeightLocal,
      viewWidthContext,
      viewHeightContext,
      sizeXContext,
      sizeYContext,
      hasMouseContext,
      hasHoverContext,
      platform,
    ]);

    React.useEffect(() => {
      const handleMediaQuery = () => {
        setViewSizeLocal((prevSizeLocal) => {
          const newViewWidthLocal = getOrDefault(
            viewWidthContext,
            getViewWidthByMediaQueries(mediaQueries)
          );
          const newViewHeightLocal = getOrDefault(
            viewHeightContext,
            getViewHeightByMediaQueries(mediaQueries)
          );

          const [prevViewWidthLocal, prevViewHeightLocal] = prevSizeLocal;

          if (
            prevViewWidthLocal !== newViewWidthLocal ||
            prevViewHeightLocal !== newViewHeightLocal
          ) {
            return [newViewWidthLocal, newViewHeightLocal];
          }

          return prevSizeLocal;
        });
      };

      if (!viewWidthContext) {
        mediaQueries.desktopPlus.addEventListener("change", handleMediaQuery);
        mediaQueries.tablet.addEventListener("change", handleMediaQuery);
        mediaQueries.smallTablet.addEventListener("change", handleMediaQuery);
        mediaQueries.mobile.addEventListener("change", handleMediaQuery);
      }

      if (!viewHeightContext) {
        mediaQueries.mediumHeight.addEventListener("change", handleMediaQuery);
        mediaQueries.mobileLandscapeHeight.addEventListener(
          "change",
          handleMediaQuery
        );
      }

      return () => {
        mediaQueries.desktopPlus.removeEventListener(
          "change",
          handleMediaQuery
        );
        mediaQueries.tablet.removeEventListener("change", handleMediaQuery);
        mediaQueries.smallTablet.removeEventListener(
          "change",
          handleMediaQuery
        );
        mediaQueries.mobile.removeEventListener("change", handleMediaQuery);
        mediaQueries.mediumHeight.removeEventListener(
          "change",
          handleMediaQuery
        );
        mediaQueries.mobileLandscapeHeight.removeEventListener(
          "change",
          handleMediaQuery
        );
      };
    }, [mediaQueries, viewWidthContext, viewHeightContext]);

    return adaptivityProps;
  };
