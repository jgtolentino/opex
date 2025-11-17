/**
 * Configuration Validator
 *
 * Provides detailed validation and health checking for OpEx configuration
 */
import type { OpExConfig } from './schema.js';
export interface ValidationIssue {
    severity: 'error' | 'warning' | 'info';
    path: string;
    message: string;
    suggestion?: string;
}
export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
}
/**
 * Validate configuration and provide actionable feedback
 */
export declare function validateConfig(config: OpExConfig): ValidationResult;
/**
 * Generate a human-readable validation report
 */
export declare function formatValidationReport(result: ValidationResult): string;
/**
 * Check if configuration can be used in current environment
 */
export declare function checkEnvironment(config: OpExConfig): Promise<ValidationIssue[]>;
//# sourceMappingURL=validator.d.ts.map