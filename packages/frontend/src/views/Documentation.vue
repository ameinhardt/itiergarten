<template>
  <div ref="swagger" />
</template>

<script setup lang="ts">
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';
import { ref, onMounted } from 'vue';
import '../assets/documentation.scss';

const swagger = ref();
onMounted(() => {
  SwaggerUIBundle({
    persistAuthorization: false,
    url: `${import.meta.env.BASE_URL}api/docs.json`,
    // url: 'https://petstore.swagger.io/v2/swagger.json',
    deepLinking: true,
    domNode: swagger.value,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset]
  });
});
</script>

<style lang="scss"></style>
