/**
 * Dependency Resolver
 * Manages field dependencies and calculates evaluation order
 */

import type {
  ProductKeywordDependency,
  ProductKeywordDependencyValue,
  DependencyMap,
  DependencyNode,
  FormState,
} from "@/types";
import { expressionEvaluator } from "./expression-evaluator";

export class DependencyResolver {
  private dependencyMap: DependencyMap;

  constructor(
    fieldDependencies: ProductKeywordDependency[],
    valueDependencies: ProductKeywordDependencyValue[]
  ) {
    this.dependencyMap = this.buildDependencyGraph(
      fieldDependencies,
      valueDependencies
    );
  }

  /**
   * Build dependency graph from configuration
   */
  private buildDependencyGraph(
    fieldDeps: ProductKeywordDependency[],
    valueDeps: ProductKeywordDependencyValue[]
  ): DependencyMap {
    const nodes = new Map<string, DependencyNode>();

    // Process field dependencies
    for (const dep of fieldDeps) {
      // Ensure both nodes exist
      if (!nodes.has(dep.changedkeyword)) {
        nodes.set(dep.changedkeyword, {
          fieldName: dep.changedkeyword,
          dependsOn: new Set(),
          affects: new Set(),
          fieldDependencies: [],
          valueDependencies: [],
        });
      }
      if (!nodes.has(dep.actionedkeyword)) {
        nodes.set(dep.actionedkeyword, {
          fieldName: dep.actionedkeyword,
          dependsOn: new Set(),
          affects: new Set(),
          fieldDependencies: [],
          valueDependencies: [],
        });
      }

      // Add dependency relationships
      const changedNode = nodes.get(dep.changedkeyword)!;
      const actionedNode = nodes.get(dep.actionedkeyword)!;

      changedNode.affects.add(dep.actionedkeyword);
      actionedNode.dependsOn.add(dep.changedkeyword);
      // Store dependency in actioned node so we can check it when calculating visibility
      actionedNode.fieldDependencies.push(dep);
    }

    // Process value dependencies
    for (const dep of valueDeps) {
      if (!nodes.has(dep.changedkeyword)) {
        nodes.set(dep.changedkeyword, {
          fieldName: dep.changedkeyword,
          dependsOn: new Set(),
          affects: new Set(),
          fieldDependencies: [],
          valueDependencies: [],
        });
      }
      if (!nodes.has(dep.actionedkeyword)) {
        nodes.set(dep.actionedkeyword, {
          fieldName: dep.actionedkeyword,
          dependsOn: new Set(),
          affects: new Set(),
          fieldDependencies: [],
          valueDependencies: [],
        });
      }

      const changedNode = nodes.get(dep.changedkeyword)!;
      const actionedNode = nodes.get(dep.actionedkeyword)!;

      changedNode.affects.add(dep.actionedkeyword);
      actionedNode.dependsOn.add(dep.changedkeyword);
      // Store dependency in actioned node so we can check it when calculating visibility
      actionedNode.valueDependencies.push(dep);
    }

    // Calculate topological order and detect cycles
    const { order, cycles } = this.topologicalSort(nodes);

    return {
      nodes,
      evaluationOrder: order,
      circularDependencies: cycles,
    };
  }

  /**
   * Topological sort to determine evaluation order
   */
  private topologicalSort(nodes: Map<string, DependencyNode>): {
    order: string[];
    cycles: string[][];
  } {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const cycles: string[][] = [];

    const visit = (nodeName: string, path: string[] = []): void => {
      if (visiting.has(nodeName)) {
        // Circular dependency detected
        const cycleStart = path.indexOf(nodeName);
        cycles.push(path.slice(cycleStart).concat(nodeName));
        return;
      }

      if (visited.has(nodeName)) {
        return;
      }

      visiting.add(nodeName);
      const node = nodes.get(nodeName);

      if (node) {
        for (const dependency of node.dependsOn) {
          visit(dependency, [...path, nodeName]);
        }
      }

      visiting.delete(nodeName);
      visited.add(nodeName);
      order.push(nodeName);
    };

    for (const nodeName of nodes.keys()) {
      if (!visited.has(nodeName)) {
        visit(nodeName);
      }
    }

    return { order, cycles };
  }

  /**
   * Get all fields affected by a field change
   */
  getAffectedFields(fieldName: string): Set<string> {
    const affected = new Set<string>();
    const node = this.dependencyMap.nodes.get(fieldName);

    if (!node) {
      return affected;
    }

    const traverse = (currentField: string): void => {
      const currentNode = this.dependencyMap.nodes.get(currentField);
      if (!currentNode) return;

      for (const affectedField of currentNode.affects) {
        if (!affected.has(affectedField)) {
          affected.add(affectedField);
          traverse(affectedField);
        }
      }
    };

    traverse(fieldName);
    return affected;
  }

  /**
   * Calculate field visibility based on dependencies
   */
  calculateVisibility(fieldName: string, formState: FormState): boolean {
    const node = this.dependencyMap.nodes.get(fieldName);
    if (!node) {
      return true; // Default to visible if no dependencies
    }

    let isVisible = true;
    let hasShowCondition = false;
    let showConditionMet = false;
    let hasActiveShowCondition = false; // Track if any show conditions have values

    // Check field dependencies
    for (const dep of node.fieldDependencies) {
      if (dep.actionedkeyword === fieldName) {
        const changedValue = formState.values[dep.changedkeyword];

        // Handle expression-based dependencies
        if (dep.expression) {
          const result = expressionEvaluator.evaluateBoolean(dep.expression, {
            values: formState.values,
          });

          if (dep.actiontotake === "hide" && result) {
            isVisible = false;
          } else if (dep.actiontotake === "show") {
            hasShowCondition = true;
            if (result) {
              showConditionMet = true;
            }
          }
        }
        // Handle value-based dependencies (no expression)
        else if (dep.changedkeywordvalue) {
          // Only apply show/hide rules if the controlling field has a value
          if (changedValue !== undefined && changedValue !== null && changedValue !== '') {
            if (
              dep.actiontotake === "hide" &&
              changedValue === dep.changedkeywordvalue
            ) {
              isVisible = false;
            } else if (dep.actiontotake === "show") {
              hasShowCondition = true;
              hasActiveShowCondition = true;
              if (changedValue === dep.changedkeywordvalue) {
                showConditionMet = true;
              }
            }
          }
        }
      }
    }

    // If there are active show conditions (with values) and none are met, hide the field
    if (hasActiveShowCondition && !showConditionMet) {
      isVisible = false;
    }

    // Note: Value dependencies (productkeyworddependencyvalue) control which OPTIONS
    // are shown in a field, not whether the field itself is visible.
    // They are handled separately in the form engine when filtering field options.

    return isVisible;
  }

  /**
   * Calculate field disabled state
   */
  calculateDisabled(fieldName: string, formState: FormState): boolean {
    const node = this.dependencyMap.nodes.get(fieldName);
    if (!node) {
      return false;
    }

    let isDisabled = false;

    for (const dep of node.fieldDependencies) {
      if (dep.actionedkeyword === fieldName) {
        if (dep.expression) {
          const result = expressionEvaluator.evaluateBoolean(dep.expression, {
            values: formState.values,
          });

          if (dep.actiontotake === "disable" && result) {
            isDisabled = true;
          }
        }
      }
    }

    for (const dep of node.valueDependencies) {
      if (dep.actionedkeyword === fieldName) {
        const changedValue = formState.values[dep.changedkeyword];

        if (
          changedValue === dep.changedkeywordvalue &&
          dep.actiontotake === "disable"
        ) {
          isDisabled = true;
        }
      }
    }

    return isDisabled;
  }

  /**
   * Calculate field readonly state
   */
  calculateReadonly(fieldName: string, formState: FormState): boolean {
    const node = this.dependencyMap.nodes.get(fieldName);
    if (!node) {
      return false;
    }

    let isReadonly = false;

    for (const dep of node.fieldDependencies) {
      if (
        dep.actionedkeyword === fieldName &&
        dep.actiontotake === "readonly"
      ) {
        if (dep.expression) {
          const result = expressionEvaluator.evaluateBoolean(dep.expression, {
            values: formState.values,
          });
          if (result) {
            isReadonly = true;
          }
        }
      }
    }

    return isReadonly;
  }

  /**
   * Update form state based on field change
   */
  updateFormState(
    fieldName: string,
    value: string,
    formState: FormState
  ): FormState {
    const newState = { ...formState };
    newState.values = { ...formState.values, [fieldName]: value };

    // Get all affected fields
    const affected = this.getAffectedFields(fieldName);

    // Update visibility, disabled, readonly states
    affected.forEach((affectedField) => {
      newState.visibility[affectedField] = this.calculateVisibility(
        affectedField,
        newState
      );
      newState.disabled[affectedField] = this.calculateDisabled(
        affectedField,
        newState
      );
      newState.readonly[affectedField] = this.calculateReadonly(
        affectedField,
        newState
      );
    });

    return newState;
  }

  /**
   * Get evaluation order for form
   */
  getEvaluationOrder(): string[] {
    return this.dependencyMap.evaluationOrder;
  }

  /**
   * Check for circular dependencies
   */
  hasCircularDependencies(): boolean {
    return this.dependencyMap.circularDependencies.length > 0;
  }

  /**
   * Get circular dependency cycles
   */
  getCircularDependencies(): string[][] {
    return this.dependencyMap.circularDependencies;
  }

  /**
   * Get dependency map
   */
  getDependencyMap(): DependencyMap {
    return this.dependencyMap;
  }
}
