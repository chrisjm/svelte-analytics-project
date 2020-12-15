import { raise } from 'layercake';

export interface ChartEventData<T extends Event = MouseEvent> {
  e: T;
  data: any;
}

export type ChartEvent<T extends Event = MouseEvent> = CustomEvent<
  ChartEventData<T>
>;

function makeEventData(e, feature) {
  return {
    e,
    data: feature,
  };
}

/** Low-level event handlers for individual components */
export function eventHandlers(dispatch) {
  function handleMousemove(feature, cb?) {
    return function handleMousemoveFn(e) {
      raise(this);
      // When the element gets raised, it flashes 0,0 for a second so skip that
      if (e.layerX !== 0 && e.layerY !== 0) {
        let data = makeEventData(e, feature);
        if (cb) {
          cb(data);
        }

        dispatch('mousemove', data);
      }
    };
  }

  function handleClick(feature) {
    return function handleClickFn(e) {
      dispatch('click', makeEventData(e, feature));
    };
  }

  return {
    mousemove: handleMousemove,
    mouseout: (cb?) => {
      return function (e) {
        if (cb) {
          cb(e);
        }
        dispatch('mouseout', { e });
      };
    },
    click: handleClick,
  };
}
