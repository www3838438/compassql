import {Channel} from 'vega-lite/build/src/channel';
import {Config} from 'vega-lite/build/src/config';
import {Data} from 'vega-lite/build/src/data';
import {Mark} from 'vega-lite/build/src/mark';

import {isWildcard, WildcardProperty, Wildcard} from '../wildcard';
import {isEncodingTopLevelProperty, Property, toKey, FlatProp, EncodingNestedProp} from '../property';
import {contains, extend, keys, some} from '../util';

import {TransformQuery} from './transform';
import {EncodingQuery, isFieldQuery, isEnabledAutoCountQuery, isAutoCountQuery} from './encoding';
import {TopLevel, FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {toMap} from 'datalib/src/util';

/**
 * A "query" version of a [Vega-Lite](https://github.com/vega/vega-lite)'s `UnitSpec` (single view specification).
 * This interface and most of  its children have `Query` suffixes to hint that their instanced are queries that
 * can contain wildcards to describe a collection of specifications.
 */
export interface SpecQuery {
  data?: Data;

  // TODO: support mark definition object
  mark: WildcardProperty<Mark>;
  transform?: TransformQuery[];

  /**
   * Array of encoding query mappings.
   * Note: Vega-Lite's `encoding` is an object whose keys are unique encoding channels.
   * However, for CompassQL, the `channel` property of encoding query mappings can be wildcards.
   * Thus the `encoding` object in Vega-Lite is flatten as the `encodings` array in CompassQL.
   */
  encodings: EncodingQuery[];

  // TODO: make config query (not important at all, only for the sake of completeness.)
  /**
   * Vega-Lite Configuration
   */
  config?: Config;
}

/**
 * Convert a Vega-Lite's ExtendedUnitSpec into a CompassQL's SpecQuery
 * @param {ExtendedUnitSpec} spec
 * @returns
 */
export function fromSpec(spec: TopLevel<FacetedCompositeUnitSpec>): SpecQuery {
  return extend(
    spec.data ? { data: spec.data} : {},
    spec.transform ? { transform: spec.transform } : {},
    {
      mark: spec.mark,
      encodings: keys(spec.encoding).map((channel: Channel) => {
          let encQ: EncodingQuery = { channel: channel };
          let channelDef = spec.encoding[channel];

          for (const prop in channelDef) {
            if (isEncodingTopLevelProperty(prop as Property) && channelDef[prop] !== undefined) {
              // Currently bin, scale, axis, legend only support boolean, but not null.
              // Therefore convert null to false.
              if (contains(['bin', 'scale', 'axis', 'legend'], prop) && channelDef[prop] === null) {
                encQ[prop] = false;
              } else {
                encQ[prop] = channelDef[prop];
              }
            }
          }

          if (isFieldQuery(encQ) && encQ.aggregate === 'count' && !encQ.field) {
            encQ.field = '*';
          }

          return encQ;
        }
      )
    },
    spec.config ? { config: spec.config } : {}
  );
}

export function isAggregate(specQ: SpecQuery) {
  return some(specQ.encodings, (encQ: EncodingQuery) => {
    return (isFieldQuery(encQ) && !isWildcard(encQ.aggregate) && !!encQ.aggregate) || isEnabledAutoCountQuery(encQ);
  });
}

/**
 * Returns true iff the given SpecQuery specifies a stack encoding.
 * @param specQ The SpecQuery in question.
 */
export function isStack(specQ: SpecQuery) {
  return isExplicitStack(specQ) || isImplicitStack(specQ);
}

/**
 * Returns true iff the given SpecQuery specifies a stack encoding explicitly.
 * @param specQ The SpecQuery in question.
 */
export function isExplicitStack(specQ: SpecQuery) {
  return some(specQ.encodings, (encQ: EncodingQuery) => {
    return (isFieldQuery(encQ) && !isWildcard(encQ.stack) && !!encQ.stack);
  });
}

/**
 * Returns true iff the given SpecQuery specifies a stack encoding implicitly
 *     by using x, y (with x or y aggregate), and color channels. Note that
 *     a query cannot be both an implicit and explicit stack spec.
 * @param specQ The SpecQuery in question.
 */
export function isImplicitStack(specQ: SpecQuery) {
  if (isExplicitStack(specQ)) {
    return false;
  }

  // check for x, y, color used -> stack
  let xUsed = false;
  let yUsed = false;
  let xOrYAggregateOrAutoCount = false;
  let colorUsed = false;
  for (let encQ of specQ.encodings) {
    if (isFieldQuery(encQ)) {
      switch(encQ.channel) {
        case Channel.X:
          xUsed = true;
          if (!!encQ.aggregate) {
            xOrYAggregateOrAutoCount = true;
          }
        case Channel.Y:
          yUsed = true;
          if (!!encQ.aggregate) {
            xOrYAggregateOrAutoCount = true;
          }
        case Channel.COLOR:
          colorUsed = true;
      }
    } else if (isAutoCountQuery(encQ) &&
               (encQ.channel === Channel.X || encQ.channel === Channel.Y)) {
      xOrYAggregateOrAutoCount = true;
    }
  }

  return xUsed && yUsed && xOrYAggregateOrAutoCount && colorUsed;
}

// /**
//  * @return the stack offset type for the specQuery
//  */
// export function stack(specQ: SpecQuery): StackProperties & {fieldEncQ: EncodingQuery, groupByEncQ: EncodingQuery} {
//   const config = specQ.config;
//   const stacked = config ? config.stack : undefined;

//   // Should not have stack explicitly disabled
//   if (contains(['none', null, false], stacked)) {
//     return null;
//   }

//   // Should have stackable mark
//   if (!contains(['bar', 'area'], specQ.mark)) {
//     return null;
//   }

//   // Should be aggregate plot
//   if (!isAggregate(specQ)) {
//     return null;
//   }

//   const stackBy = specQ.encodings.reduce((sc, encQ: EncodingQuery) => {
//     if (contains(NONSPATIAL_CHANNELS, encQ.channel) && (isValueQuery(encQ) || (isFieldQuery(encQ) &&!encQ.aggregate))) {
//       sc.push({
//         channel: encQ.channel,
//         fieldDef: encQ
//       });
//     }
//     return sc;
//   }, []);

//   if (stackBy.length === 0) {
//     return null;
//   }

//   // Has only one aggregate axis
//   const xEncQ = specQ.encodings.reduce((f, encQ: EncodingQuery) => {
//     return f || (encQ.channel === Channel.X ? encQ : null);
//   }, null);
//   const yEncQ = specQ.encodings.reduce((f, encQ: EncodingQuery) => {
//     return f || (encQ.channel === Channel.Y ? encQ : null);
//   }, null);

//   // TODO(akshatsh): Check if autoCount undef is ok
//   const xIsAggregate = (isFieldQuery(xEncQ) && !!xEncQ.aggregate) || (isAutoCountQuery(xEncQ) &&!!xEncQ.autoCount);
//   const yIsAggregate = (isFieldQuery(yEncQ) && !!yEncQ.aggregate) || (isAutoCountQuery(yEncQ) &&!!yEncQ.autoCount);

//   if (xIsAggregate !== yIsAggregate) {
//     return {
//       groupbyChannel: xIsAggregate ? (!!yEncQ ? Y : null) : (!!xEncQ ? X : null),
//       groupByEncQ: xIsAggregate ? yEncQ : xEncQ,
//       fieldChannel: xIsAggregate ? X : Y,
//       fieldEncQ: xIsAggregate ? xEncQ : yEncQ,
//       impute: contains(['area', 'line'], specQ.mark),
//       stackBy: stackBy,
//       offset: stacked || 'zero'
//     };
//   }
//   return null;
// }

export function hasWildcard(specQ: SpecQuery, opt: {exclude?: Property[]} = {}) {
  const exclude = opt.exclude ? toMap(opt.exclude.map(toKey)) : {};
  if (isWildcard(specQ.mark) && !exclude['mark']) {
    return true;
  }

  for (const encQ of specQ.encodings) {
    // TODO: implement more efficiently, just check only properties of encQ
    for (const key in encQ) {
      const parentProp = key as FlatProp;
      if (encQ.hasOwnProperty(parentProp) && isEncodingTopLevelProperty(parentProp)) {

        if(isWildcard(encQ[parentProp]) && !exclude[parentProp]) {
          return true;
        }

        const propObj = encQ[parentProp];
        for (const childProp in propObj) {
          if (propObj.hasOwnProperty(childProp) && !contains(['enum', 'name'] as (keyof Wildcard<any>)[], childProp)) {
            const prop: EncodingNestedProp = {
              parent: parentProp,
              child: childProp
            } as EncodingNestedProp;

            if (isWildcard(propObj[childProp]) && !exclude[toKey(prop)]) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}
