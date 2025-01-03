import { ShadowElement } from "@pattaya/depict/graph";
import { GraphLayout } from "./layout";
import { buildPkgCard } from "./ui/pkg/card";
import { buildArrow } from "./ui/pkg/arrow";
import { statePkg } from "./ui/pkg/state";
import data from "../data";
import { buildInfoCard } from "./ui/pkg/info";
import { Callable, File, Pkg } from "../resource/node";
import { stateCall } from "./ui/call/state";
import { buildCallCard } from "./ui/call/card";

export class GraphBuilder {
  constructor() { }

  buildPkgLayers(): ShadowElement[][] {
    const layer0: ShadowElement[] = [];
    const pkgs = statePkg.state.set;
    if (pkgs.size === 0) return [];
    const pkgSet = new Set<Pkg>();
    for (const el of pkgs) {
      pkgSet.add(data.pkgs.get(el)!);
    }
    const layoutResult = GraphLayout.layoutPkgsDagre(pkgSet, 60, 60);
    for (const pkg of pkgSet) {
      const node = layoutResult.nodes.get(pkg.ref.id);
      if (node) {
        layer0.push(buildPkgCard(node.x - 80, node.y - 60, pkg.ref.id, pkg.path, pkg.files.size, pkg.callables.size, pkg.abstracts.size));
      }
    }
    for (const edge of layoutResult.edges) {
      layer0.push(buildArrow(edge.startID, edge.endID, edge.points));
    }

    const layer1: ShadowElement[] = [buildInfoCard()];

    return [layer0, layer1];
  }

  buildFileLayers(): ShadowElement[][] {
    let layers: ShadowElement[][] = [];

    return layers;
  }

  buildCallLayers(): ShadowElement[][] {
    const layer0: ShadowElement[] = [];
    const fileCalls = stateCall.state.set;
    const entrancePkg = data.callables.get(stateCall.state.entrance)!.file.pkg;
    if (fileCalls.size === 0) return [];
    const layoutResult = GraphLayout.layoutFileCallsDagre(fileCalls, 60, 60);
    for (const fc of fileCalls) {
      const node = layoutResult.nodes.get(fc.file);
      if (node) {
        const file = data.files.get(fc.file)!;
        const callables: Callable[] = [];
        for (const el of fc.callables) {
          callables.push(data.callables.get(el)!);
        }
        const enter = entrancePkg === file.pkg;
        layer0.push(buildCallCard(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h, file, callables, enter));
      }
    }
    for (const edge of layoutResult.edges) {
      layer0.push(buildArrow(edge.startID, edge.endID, edge.points));
    }

    return [layer0];
  }
};