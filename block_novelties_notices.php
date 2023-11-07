<?php

class block_novelties_notices extends block_base
{
    function init(){
        $this->title = get_string('pluginname','block_novelties_notices');
    }

    function get_content()
    {
        global $PAGE;

        if ($this->content !== null) {
            return $this->content;
        }

        if (empty($this->instance)) {
            $this->content = '';
            return $this->content;
        }

        $this->content = new stdClass;

        $content = [];

        $renderer = $this->page->get_renderer('block_novelties_notices');
        $this->content->text = $renderer->render_novelties($content);
        $this->content->footer = '';

        return $this->content;
    }
}