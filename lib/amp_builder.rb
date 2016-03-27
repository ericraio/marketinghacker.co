require 'fileutils'
require_relative 'amp_filter'

class AmpBuilder
  class << self
    def build(app, sitemap, config)
      Middleman::TemplateContext.send :include, Middleman::Blog::Helpers
      Middleman::TemplateContext.send :include, MiddlemanCasperHelpers
      resources = sitemap.resources.select { |r| r.is_a?(Middleman::Blog::BlogArticle) }
      resources.each do |resource|
        path = resource.destination_path.split('/')
        destination_path = File.join(config[:build_dir], 'amp-' + path[0])
        FileUtils.mkdir_p(destination_path)
        amp_html = Proc.new { AmpFilter.amp_images(resource.body) }
        ctx = Middleman::TemplateContext.new(app, {
          current_path: resource.destination_path
        })
        ctx.init_haml_helpers
        ctx.current_engine = :erb
        layout_file = ::Middleman::TemplateRenderer.locate_layout(app, :amp_layout, ctx.current_engine)
        html = ctx.send(:render_file, layout_file, {}, {}, &amp_html)
        File.open(destination_path + '/index.html', "w") { |file| file.write(html) }
      end
    end
  end
end
