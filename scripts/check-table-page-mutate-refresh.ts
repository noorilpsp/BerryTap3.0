/**
 * POS Table Page mutate->refresh guardrail
 * Run with: npm run check:pos-table-page-mutate-refresh
 */

import { readFileSync } from "fs"
import { resolve, relative } from "path"
import ts from "typescript"

const TABLE_PAGE = resolve(process.cwd(), "src/app/table/[id]/page.tsx")

function calleeName(expression: ts.LeftHandSideExpression): string | null {
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text
  return null
}

function hasAncestorCallNamed(node: ts.Node, name: string): boolean {
  let current: ts.Node | undefined = node.parent
  while (current) {
    if (ts.isCallExpression(current) && calleeName(current.expression) === name) {
      return true
    }
    current = current.parent
  }
  return false
}

function nearestFunctionName(node: ts.Node): string | null {
  let current: ts.Node | undefined = node.parent
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) {
      return current.name.text
    }
    if (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
      const parent = current.parent
      if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
        return parent.name.text
      }
      if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
        return parent.name.text
      }
    }
    current = current.parent
  }
  return null
}

function formatLine(sourceFile: ts.SourceFile, node: ts.Node): string {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  return `${line + 1}:${character + 1}`
}

function main() {
  const content = readFileSync(TABLE_PAGE, "utf-8")
  const sourceFile = ts.createSourceFile(TABLE_PAGE, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

  const fetchPosViolations: string[] = []
  const refreshViolations: string[] = []

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const name = calleeName(node.expression)

      if (name === "fetchPos" && !hasAncestorCallNamed(node, "mutateThenRefresh")) {
        fetchPosViolations.push(formatLine(sourceFile, node))
      }

      if (name === "refreshTableView" && !hasAncestorCallNamed(node, "mutateThenRefresh")) {
        const fnName = nearestFunctionName(node)
        if (fnName && (/^handle[A-Z]/.test(fnName) || fnName === "fireWaveNumber")) {
          refreshViolations.push(`${formatLine(sourceFile, node)} (${fnName})`)
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  if (fetchPosViolations.length > 0 || refreshViolations.length > 0) {
    console.error("check-table-page-mutate-refresh: FAIL")
    console.error(`  file: ${relative(process.cwd(), TABLE_PAGE)}`)
    if (fetchPosViolations.length > 0) {
      console.error("  fetchPos() outside mutateThenRefresh:")
      for (const pos of fetchPosViolations) console.error(`    - ${pos}`)
    }
    if (refreshViolations.length > 0) {
      console.error("  direct refreshTableView() in handler:")
      for (const pos of refreshViolations) console.error(`    - ${pos}`)
    }
    process.exit(1)
  }

  console.log("check-table-page-mutate-refresh: PASS")
}

main()
