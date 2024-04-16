<?php

namespace WPGraphQL\Type;

use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\ObjectType;
use WPGraphQL\Data\DataSource;
use WPGraphQL\Registry\TypeRegistry;

/**
 * Class WPObjectType
 *
 * Object Types should extend this class to take advantage of the helper methods
 * and consistent filters.
 *
 * @package WPGraphQL\Type
 * @since   0.0.5
 */
class WPObjectType extends ObjectType {

	use WPInterfaceTrait;

	/**
	 * Holds the node_interface definition allowing WPObjectTypes
	 * to easily define themselves as a node type by implementing
	 * self::$node_interface
	 *
	 * @var array<string,mixed>|\WPGraphQL\Type\InterfaceType\Node $node_interface
	 * @since 0.0.5
	 */
	private static $node_interface;

	/**
	 * Instance of the Type Registry
	 *
	 * @var \WPGraphQL\Registry\TypeRegistry
	 */
	public $type_registry;

	/**
	 * @var array<string,mixed>
	 */
	public $config;

	/**
	 * @var array<string, array<string, mixed>>
	 */
	public $fields;

	/**
	 * @var array<\GraphQL\Type\Definition\InterfaceType>
	 */
	public $interfaces;

	/**
	 * WPObjectType constructor.
	 *
	 * @param array<string,mixed>              $config
	 * @param \WPGraphQL\Registry\TypeRegistry $type_registry
	 *
	 * @throws \Exception
	 * @since 0.0.5
	 */
	public function __construct( $config, TypeRegistry $type_registry ) {

		/**
		 * Get the Type Registry
		 */
		$this->type_registry = $type_registry;

		/**
		 * Filter the config of WPObjectType
		 *
		 * @param array<string,mixed>          $config         Array of configuration options passed to the WPObjectType when instantiating a new type
		 * @param \WPGraphQL\Type\WPObjectType $wp_object_type The instance of the WPObjectType class
		 */
		$config = apply_filters( 'graphql_wp_object_type_config', $config, $this );

		$this->config = $config;

		/**
		 * Set the Types to start with capitals
		 */
		$name           = ucfirst( $config['name'] );
		$config['name'] = apply_filters( 'graphql_type_name', $name, $config, $this );

		/**
		 * Setup the fields
		 *
		 * @return array<string, array<string, mixed>> $fields
		 */
		$config['fields'] = ! empty( $this->fields ) ? $this->fields : function () use ( $config ) {
			$fields = $config['fields'];

			$fields = array_filter( $fields );

			$raw_fields = $fields;

			/**
			 * Get the fields of interfaces and ensure they exist as fields of this type.
			 *
			 * Types are still responsible for ensuring the fields resolve properly.
			 */
			$interface_fields = [];
			if ( ! empty( $this->getInterfaces() ) && is_array( $this->getInterfaces() ) ) {
				foreach ( $this->getInterfaces() as $interface_type ) {
					if ( ! $interface_type instanceof InterfaceType ) {
						$interface_type = $this->type_registry->get_type( $interface_type );
					}

					if ( ! $interface_type instanceof InterfaceType ) {
						continue;
					}

					$interface_config_fields = $interface_type->getFields();

					if ( empty( $interface_config_fields ) ) {
						continue;
					}

					foreach ( $interface_config_fields as $interface_field_name => $interface_field ) {
						$interface_fields[ $interface_field_name ] = $interface_field->config;
					}
				}
			}

			// diff the $interface_fields and the $fields
			// if the field is not in $fields, add it
			$diff = ! empty( $interface_fields ) ? array_diff_key( $interface_fields, $fields ) : [];

			// If the Interface has fields defined that are not defined
			// on the Object Type, add them to the Object Type
			if ( ! empty( $diff ) ) {
				$fields = array_merge( $fields, $diff );
			}

			foreach ( $fields as $field_name => $field ) {
				if ( ! isset( $field['type'] ) ) {
					if ( isset( $interface_fields[ $field_name ]['type'] ) ) {
						$fields[ $field_name ]['type'] = $interface_fields[ $field_name ]['type'];
					} else {
						unset( $fields[ $field_name ] );
					}
				}
			}

			$fields = $this->prepare_fields( $fields, $config['name'], $config );
			$fields = $this->type_registry->prepare_fields( $fields, $config['name'] );

			$this->fields = $fields;
			return $this->fields;
		};

		/**
		 * Run an action when the WPObjectType is instantiating
		 *
		 * @param array<string,mixed>          $config         Array of configuration options passed to the WPObjectType when instantiating a new type
		 * @param \WPGraphQL\Type\WPObjectType $wp_object_type The instance of the WPObjectType class
		 */
		do_action( 'graphql_wp_object_type', $config, $this );

		parent::__construct( $config );
	}

	/**
	 * Get the interfaces implemented by the ObjectType
	 *
	 * @return \GraphQL\Type\Definition\InterfaceType[]
	 */
	public function getInterfaces(): array {
		if ( ! empty( $this->interfaces ) ) {
			return $this->interfaces;
		}
		$this->interfaces = $this->get_implemented_interfaces();
		return $this->interfaces;
	}

	/**
	 * Node_interface
	 *
	 * This returns the node_interface definition allowing
	 * WPObjectTypes to easily implement the node_interface
	 *
	 * @return array<string,mixed>|\WPGraphQL\Type\InterfaceType\Node
	 * @since 0.0.5
	 */
	public static function node_interface() {
		if ( null === self::$node_interface ) {
			$node_interface       = DataSource::get_node_definition();
			self::$node_interface = $node_interface['nodeInterface'];
		}

		return self::$node_interface;
	}

	/**
	 * This function sorts the fields and applies a filter to allow for easily
	 * extending/modifying the shape of the Schema for the type.
	 *
	 * @param array<string,mixed> $fields    The array of fields for the object config
	 * @param string              $type_name
	 * @param array<string,mixed> $config    The config for the Object Type
	 *
	 * @return array<string,mixed>
	 * @since 0.0.5
	 */
	public function prepare_fields( $fields, $type_name, $config ) {

		/**
		 * Filter all object fields, passing the $typename as a param
		 *
		 * This is useful when several different types need to be easily filtered at once. . .for example,
		 * if ALL types with a field of a certain name needed to be adjusted, or something to that tune
		 *
		 * @param array<string,mixed>              $fields         The array of fields for the object config
		 * @param string                           $type_name      The name of the object type
		 * @param \WPGraphQL\Type\WPObjectType     $wp_object_type The WPObjectType Class
		 * @param \WPGraphQL\Registry\TypeRegistry $type_registry  The Type Registry
		 */
		$fields = apply_filters( 'graphql_object_fields', $fields, $type_name, $this, $this->type_registry );

		/**
		 * Filter once with lowercase, once with uppercase for Back Compat.
		 */
		$lc_type_name = lcfirst( $type_name );
		$uc_type_name = ucfirst( $type_name );

		/**
		 * Filter the fields with the typename explicitly in the filter name
		 *
		 * This is useful for more targeted filtering, and is applied after the general filter, to allow for
		 * more specific overrides
		 *
		 * @param array<string,mixed>              $fields         The array of fields for the object config
		 * @param \WPGraphQL\Type\WPObjectType     $wp_object_type The WPObjectType Class
		 * @param \WPGraphQL\Registry\TypeRegistry $type_registry  The Type Registry
		 */
		$fields = apply_filters( "graphql_{$lc_type_name}_fields", $fields, $this, $this->type_registry );

		/**
		 * Filter the fields with the typename explicitly in the filter name
		 *
		 * This is useful for more targeted filtering, and is applied after the general filter, to allow for
		 * more specific overrides
		 *
		 * @param array<string,mixed>              $fields         The array of fields for the object config
		 * @param \WPGraphQL\Type\WPObjectType     $wp_object_type The WPObjectType Class
		 * @param \WPGraphQL\Registry\TypeRegistry $type_registry  The Type Registry
		 */
		$fields = apply_filters( "graphql_{$uc_type_name}_fields", $fields, $this, $this->type_registry );

		/**
		 * This sorts the fields alphabetically by the key, which is super handy for making the schema readable,
		 * as it ensures it's not output in just random order
		 */
		ksort( $fields );

		return $fields;
	}
}
