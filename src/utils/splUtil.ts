export interface ValidationError {
    message: string;
    path: string; // e.g., "choose_an_option.option_1.text_label"
    value: any;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
  }
  
  /**
   * Simple validation that returns only true or false
   * @param userResponse - The user response JSON to validate
   * @returns true if valid, false otherwise
   */
  export const isValidUserResponse = (userResponse: any): boolean => {
    const result = validateUserResponse(userResponse);
    return result.isValid;
  };
  
  /**
   * Validates user response JSON based on "selected" flag logic and leaf node validation
   * 
   * Rules:
   * 1. If object has "selected": true, all sibling properties must have values:
   *    - Non-boolean values must be non-empty strings
   *    - Boolean values must be true
   * 2. If object doesn't have "selected" key, at least one property must be a boolean true
   * 3. At leaf level (no nested objects), enforce strict validation for selected: true
   * 
   * @param userResponse - The user response JSON to validate
   * @returns ValidationResult with isValid flag and list of errors
   */
  export const validateUserResponse = (userResponse: any): ValidationResult => {
    const errors: ValidationError[] = [];
  
    if (!userResponse || typeof userResponse !== "object") {
      return {
        isValid: false,
        errors: [
          {
            message: "User response must be a valid JSON object",
            path: "root",
            value: userResponse,
          },
        ],
      };
    }
  
    // Start validation from root level
    validateObject(userResponse, "", errors);
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
  
  /**
   * Recursively validates an object and its nested properties
   */
  const validateObject = (
    obj: any,
    currentPath: string,
    errors: ValidationError[]
  ): void => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return;
    }
  
    const hasSelected = "selected" in obj;
    const isSelected = obj.selected === true;
  
    // Check if this object has any nested objects (non-leaf node)
    const hasNestedObjects = Object.entries(obj).some(
      ([key, value]) =>
        key !== "selected" &&
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
  
    // Rule 1: If this object has selected: true, validate all sibling properties
    if (hasSelected && isSelected) {
      const siblingProperties = Object.entries(obj).filter(
        ([key]) => key !== "selected"
      );
  
      for (const [key, value] of siblingProperties) {
        const propertyPath = currentPath ? `${currentPath}.${key}` : key;
  
        // If the value is an object (nested), recurse into it
        if (value && typeof value === "object" && !Array.isArray(value)) {
          validateObject(value, propertyPath, errors);
        }
        // At leaf level: validate non-object values strictly
        else if (!hasNestedObjects) {
          // Boolean values must be true
          if (typeof value === "boolean") {
            if (value !== true) {
              errors.push({
                message: `Required field must be true (parent has "selected": true)`,
                path: propertyPath,
                value,
              });
            }
          }
          // String values must be non-empty
          else if (typeof value === "string") {
            if (value.trim() === "") {
              errors.push({
                message: `Required field is empty (parent has "selected": true)`,
                path: propertyPath,
                value,
              });
            }
          }
          // null or undefined are errors
          else if (value === null || value === undefined) {
            errors.push({
              message: `Required field is null/undefined (parent has "selected": true)`,
              path: propertyPath,
              value,
            });
          }
        }
      }
    }
  
    // Rule 2: If object doesn't have "selected" key, at least one property must be a boolean true
    if (!hasSelected) {
      const properties = Object.entries(obj);
      const hasBooleanTrue = properties.some(([, value]) => value === true);
  
      // Only report error if there are no nested objects to validate
      // If there are nested objects, they will be validated recursively
      if (!hasBooleanTrue && !hasNestedObjects) {
        errors.push({
          message: `Object must have at least one property with boolean value true (no "selected" key found)`,
          path: currentPath || "root",
          value: obj,
        });
      }
    }
  
    // Recursively validate nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (key === "selected") continue;
  
      const propertyPath = currentPath ? `${currentPath}.${key}` : key;
  
      if (value && typeof value === "object" && !Array.isArray(value)) {
        validateObject(value, propertyPath, errors);
      }
    }
  };
  
  /**
   * Helper function to get user-friendly error report
   */
  export const getErrorReport = (result: ValidationResult): string => {
    if (result.isValid) {
      return "✓ User response is valid";
    }
  
    const report = result.errors
      .map(
        (err, idx) =>
          `${idx + 1}. ${err.message}\n   Path: ${err.path}\n   Value: ${JSON.stringify(err.value)}`
      )
      .join("\n\n");
  
    return `✗ Validation failed with ${result.errors.length} error(s):\n\n${report}`;
  };
  
  /**
   * Get errors for a specific path (useful for UI feedback)
   */
  export const getErrorsForPath = (
    result: ValidationResult,
    path: string
  ): ValidationError[] => {
    return result.errors.filter((err) => err.path === path);
  };
  
  /**
   * Get all errors that start with a given path prefix
   */
  export const getErrorsForPathPrefix = (
    result: ValidationResult,
    pathPrefix: string
  ): ValidationError[] => {
    return result.errors.filter((err) => err.path.startsWith(pathPrefix));
  };
  
  /**
   * Get a summary of errors grouped by top-level field
   */
  export const getErrorSummary = (
    result: ValidationResult
  ): Record<string, ValidationError[]> => {
    const summary: Record<string, ValidationError[]> = {};
  
    result.errors.forEach((error) => {
      const topLevelKey = error.path.split(".")[0];
      if (!summary[topLevelKey]) {
        summary[topLevelKey] = [];
      }
      summary[topLevelKey].push(error);
    });
  
    return summary;
  };
  
  /**
   * Validates and returns detailed debug info
   */
  export const validateWithDebug = (userResponse: any): ValidationResult & {
    summary: Record<string, ValidationError[]>;
    errorCount: number;
  } => {
    const result = validateUserResponse(userResponse);
    return {
      ...result,
      summary: getErrorSummary(result),
      errorCount: result.errors.length,
    };
  };