require 'byebug'
require "lib/uuid"
require "lib/amp_builder"

Time.zone = "America/Los_Angeles"

config[:casper] = {
  blog: {
    url: 'https://marketinghacker.co',
    name: 'Marketing Hacker',
    description: 'Bridging the gap between Marketers and Developers',
    date_format: '%d %B %Y',
    navigation: true,
    logo: nil # Optional
  },
  author: {
    name: 'Eric Raio',
    bio: 'Former Sr. Software Engineer at Sony and Bandsintown.', # Optional
    location: 'San Diego, CA', # Optional
    website: nil, # Optional
    gravatar_email: 'ericraio@gmail.com', # Optional
    twitter: '@ericraio' # Optional
  },
  navigation: {
    "Home" => "/",
    "About Me" => "/author/eric-raio/"
  }
}

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (https://middlemanapp.com/advanced/dynamic_pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

def get_tags(resource)
  if resource.data.tags.is_a? String
    resource.data.tags.split(',').map(&:strip)
  else
    resource.data.tags
  end
end

def group_lookup(resource, sum)
  results = Array(get_tags(resource)).map(&:to_s).map(&:to_sym)

  results.each do |k|
    sum[k] ||= []
    sum[k] << resource
  end
end

tags = resources
  .select { |resource| resource.data.tags }
  .each_with_object({}, &method(:group_lookup))

tags.each do |tag, articles|
  proxy "/tag/#{tag.downcase.to_s.parameterize}/feed.xml", '/feed.xml',
    locals: { tag: tag, articles: articles[0..5] }, layout: false
end

proxy "/author/#{config.casper[:author][:name].parameterize}.html",
  '/author.html', ignore: true

# General configuration
# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

###
# Helpers
###

activate :blog do |blog|
  # This will add a prefix to all links, template references and source paths
  # blog.prefix = "blog"

  blog.permalink = "/{slug}.html"
  # Matcher for blog source files
  blog.sources = "articles/{title}.html"
  blog.taglink = "tag/{tag}.html"
  # blog.layout = "layout"
  # blog.summary_separator = /(READMORE)/
  blog.summary_length = 250
  # blog.year_link = "{year}.html"
  # blog.month_link = "{year}/{month}.html"
  # blog.day_link = "{year}/{month}/{day}.html"
  # blog.default_extension = ".markdown"

  blog.tag_template = "tag.html"
  #blog.calendar_template = "calendar.html"

  # Enable pagination
  blog.paginate = true
  blog.per_page = 10
  blog.page_link = "page/{num}"
end

# Pretty URLs - https://middlemanapp.com/advanced/pretty_urls/
activate :directory_indexes

# Middleman-Syntax - https://github.com/middleman/middleman-syntax
set :haml, { ugly: true }
set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true, smartypants: true, footnotes: true,
  link_attributes: { rel: 'nofollow' }, tables: true
activate :syntax, line_numbers: false

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

# Build-specific configuration
configure :build do
  activate :minify_css
  activate :minify_javascript
  activate :asset_hash
  activate :relative_assets
  ignore 'javascripts/_*'
  ignore 'javascripts/vendor/*'
  ignore 'stylesheets/_*'
  ignore 'stylesheets/vendor/*'
  ignore 'bower_components/*'
end

after_configuration do
  sprockets.append_path "#{root}/source/bower_components"
end

activate :deploy do |deploy|
  deploy.deploy_method = :git
  deploy.build_before = true
end

# Create an RFC4122 UUID http://www.ietf.org/rfc/rfc4122.txt
set :uuid, UUID.create_sha1('marketinghacker.co', UUID::NameSpace_URL)

after_build do
  AmpBuilder.build(app, sitemap, config)
end
